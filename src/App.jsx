import { useEffect, useMemo, useState } from 'react'
import { supabase, isSupabaseConfigured, supabaseConfigIssue } from './lib/supabaseClient'
import Header from './components/Header'
import DashboardStats from './components/DashboardStats'
import FilterBar from './components/FilterBar'
import TaskList from './components/TaskList'
import TaskForm from './components/TaskForm'
import AuthForm from './components/AuthForm'
import ResetPasswordForm from './components/ResetPasswordForm'
import StudyTimeForm from './components/StudyTimeForm'
import DeleteAccountModal from './components/DeleteAccountModal'
import StudySessionBanner from './components/StudySessionBanner'
import TonightPlan from './components/TonightPlan'
import { RitualBanner } from './components/RitualChecklist'
import FocusSession from './components/FocusSession'
import { useStudyReminder } from './hooks/useStudyReminder'
import {
  dismissStudySession,
  isSessionDismissedToday,
  rearmStudyReminder,
  clearStudyflowLocalData,
} from './utils/studyTime'
import { getAvailableTonightHours, planTonight } from './utils/tonight'
import {
  deleteTaskAttachment,
  deleteTaskAttachmentFiles,
  uploadTaskAttachments,
} from './lib/attachments'
import {
  PRIORITY_WEIGHT,
  buildSpawnedTask,
  getEffectivePriority,
  getUrgency,
  hoursUntilDeadline,
  isEmergency,
  isTaskClosed,
  shouldSpawnNext,
  statusToDone,
  toTaskPayload,
} from './utils/taskUtils'

const FOCUS_KEY = 'studyflow:focus-session'

function readFocusSession() {
  try {
    const raw = localStorage.getItem(FOCUS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured)
  const [profile, setProfile] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('semua')
  const [sort, setSort] = useState('deadline')
  const [editingTask, setEditingTask] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [studyTimeFormOpen, setStudyTimeFormOpen] = useState(false)
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)
  const [sessionDismissed, setSessionDismissed] = useState(() => isSessionDismissedToday())
  const [focusSession, setFocusSession] = useState(() => readFocusSession())
  const [passwordRecovery, setPasswordRecovery] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured) return

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession)
      setAuthLoading(false)
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) {
      setTasks([])
      setProfile(null)
      return
    }
    fetchTasks()
    fetchProfile(session.user.id)
  }, [session])

  async function fetchTasks() {
    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('tasks')
      .select('*, attachments:task_attachments(*)')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(`Gagal memuat tugas: ${fetchError.message}`)
    } else {
      setTasks(data)
      setError(null)
    }
    setLoading(false)
  }

  async function fetchProfile(userId) {
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (fetchError) {
      setError(`Gagal memuat profil: ${fetchError.message}`)
      return
    }

    if (data) {
      setProfile(data)
      return
    }

    const { data: created, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        name: session?.user?.user_metadata?.name || null,
      })
      .select()
      .single()

    if (!insertError) setProfile(created)
  }

  async function handleSaveStudyTime({ studyTime, sleepTime }) {
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({ study_time: studyTime, sleep_time: sleepTime })
      .eq('id', session.user.id)
      .select()
      .single()

    if (updateError) {
      setError(`Gagal menyimpan jam belajar: ${updateError.message}`)
      return
    }
    rearmStudyReminder()
    setSessionDismissed(false)
    setProfile(data)
    setStudyTimeFormOpen(false)
  }

  function upsertTask(saved) {
    setTasks((prev) => {
      const exists = prev.some((task) => task.id === saved.id)
      if (exists) return prev.map((task) => (task.id === saved.id ? saved : task))
      return [saved, ...prev]
    })
  }

  async function maybeSpawnNext(saved) {
    if (!shouldSpawnNext(saved)) return saved

    const nextPayload = buildSpawnedTask(saved)
    const { data: spawned, error: spawnError } = await supabase
      .from('tasks')
      .insert(nextPayload)
      .select('*, attachments:task_attachments(*)')
      .single()

    if (spawnError) {
      setError(`Tugas tersimpan, tapi gagal membuat jadwal berikutnya: ${spawnError.message}`)
      return saved
    }

    const { data: marked, error: markError } = await supabase
      .from('tasks')
      .update({ spawned_next: true, series_id: nextPayload.series_id })
      .eq('id', saved.id)
      .select('*, attachments:task_attachments(*)')
      .single()

    if (!markError && marked) upsertTask(marked)
    upsertTask(spawned)
    return marked || saved
  }

  async function persistTask(saved, files = []) {
    let next = { ...saved, attachments: saved.attachments || [] }
    if (files.length > 0) {
      try {
        const uploaded = await uploadTaskAttachments(session.user.id, saved.id, files)
        next = { ...next, attachments: [...next.attachments, ...uploaded] }
      } catch (uploadError) {
        setError(`Tugas tersimpan, tapi lampiran gagal: ${uploadError.message}`)
      }
    }
    upsertTask(next)
    await maybeSpawnNext(next)
    return next
  }

  async function handleSubmitForm(form, files = []) {
    const payload = toTaskPayload(form)

    if (editingTask) {
      const { data, error: updateError } = await supabase
        .from('tasks')
        .update(payload)
        .eq('id', editingTask.id)
        .select('*, attachments:task_attachments(*)')
        .single()

      if (updateError) {
        setError(`Gagal menyimpan perubahan: ${updateError.message}`)
        return
      }
      await persistTask(data, files)
    } else {
      const { data, error: insertError } = await supabase
        .from('tasks')
        .insert(payload)
        .select('*, attachments:task_attachments(*)')
        .single()

      if (insertError) {
        setError(`Gagal menambah tugas: ${insertError.message}`)
        return
      }
      await persistTask({ ...data, attachments: data.attachments || [] }, files)
    }
    closeForm()
  }

  async function handleStatusChange(task, status) {
    const payload = {
      status,
      is_done: statusToDone(status),
    }

    const { data, error: updateError } = await supabase
      .from('tasks')
      .update(payload)
      .eq('id', task.id)
      .select('*, attachments:task_attachments(*)')
      .single()

    if (updateError) {
      setError(`Gagal mengubah status: ${updateError.message}`)
      return
    }
    upsertTask(data)
    await maybeSpawnNext(data)
  }

  async function handleDelete(task) {
    if (!window.confirm(`Hapus tugas "${task.title}"?`)) return

    try {
      await deleteTaskAttachmentFiles(task.attachments || [])
    } catch {
      // lanjut hapus baris tugas meski file storage gagal
    }

    const { error: deleteError } = await supabase.from('tasks').delete().eq('id', task.id)

    if (deleteError) {
      setError(`Gagal menghapus tugas: ${deleteError.message}`)
      return
    }
    setTasks((prev) => prev.filter((item) => item.id !== task.id))
    if (focusSession?.taskId === task.id) {
      localStorage.removeItem(FOCUS_KEY)
      setFocusSession(null)
    }
  }

  async function handleRitualToggle(task, key, checked) {
    const ritual_checks = { ...(task.ritual_checks || {}), [key]: checked }
    const { data, error: updateError } = await supabase
      .from('tasks')
      .update({ ritual_checks })
      .eq('id', task.id)
      .select('*, attachments:task_attachments(*)')
      .single()

    if (updateError) {
      setError(`Gagal menyimpan checklist: ${updateError.message}`)
      return
    }
    upsertTask(data)
  }

  async function handleDeleteAttachment(attachment) {
    try {
      await deleteTaskAttachment(attachment)
      setTasks((prev) =>
        prev.map((task) =>
          task.id === attachment.task_id
            ? {
                ...task,
                attachments: (task.attachments || []).filter((item) => item.id !== attachment.id),
              }
            : task,
        ),
      )
    } catch (deleteError) {
      setError(`Gagal menghapus lampiran: ${deleteError.message}`)
    }
  }

  function startFocus(task) {
    if (!task) return
    const minutes =
      reminder.session?.phase === 'active' && reminder.session.minutesLeft > 0
        ? Math.min(Math.max(reminder.session.minutesLeft, 15), 90)
        : 25
    const next = { taskId: task.id, startedAt: Date.now(), durationSec: minutes * 60 }
    localStorage.setItem(FOCUS_KEY, JSON.stringify(next))
    setFocusSession(next)
  }

  function stopFocus() {
    localStorage.removeItem(FOCUS_KEY)
    setFocusSession(null)
  }

  function addFocusTime(extraSec) {
    setFocusSession((prev) => {
      if (!prev) return prev
      const next = { ...prev, durationSec: prev.durationSec + extraSec }
      localStorage.setItem(FOCUS_KEY, JSON.stringify(next))
      return next
    })
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  async function handleDeleteAccount() {
    const { error: deleteError } = await supabase.rpc('delete_own_account')
    if (deleteError) {
      if (deleteError.message?.includes('Could not find the function')) {
        throw new Error('Jalankan supabase/schema.sql terbaru di SQL Editor dulu (fungsi hapus akun belum ada).')
      }
      throw new Error(deleteError.message)
    }
    clearStudyflowLocalData()
    await supabase.auth.signOut({ scope: 'local' })
    setDeleteAccountOpen(false)
  }

  function openAddForm() {
    setEditingTask(null)
    setFormOpen(true)
  }

  function openEditForm(task) {
    setEditingTask(task)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingTask(null)
  }

  const visibleTasks = useMemo(() => {
    const filtered = tasks.filter((task) => {
      const status = task.status || (task.is_done ? 'dikumpul' : 'belum_mulai')
      if (filter === 'aktif') return !isTaskClosed(task)
      if (filter === 'belum_mulai' || filter === 'dikerjakan' || filter === 'dikumpul' || filter === 'menunggu_nilai') {
        return status === filter
      }
      if (filter === 'darurat') return isEmergency(task)
      if (filter === 'mendekati') return getUrgency(task) === 'mendekati'
      if (filter === 'terlambat') return getUrgency(task) === 'terlambat'
      if (filter === 'selesai' || filter === 'belum') return filter === 'selesai' ? isTaskClosed(task) : !isTaskClosed(task)
      return true
    })

    return [...filtered].sort((a, b) => {
      const aClosed = isTaskClosed(a)
      const bClosed = isTaskClosed(b)
      if (aClosed !== bClosed) return aClosed ? 1 : -1

      if (sort === 'prioritas') {
        const byPriority = PRIORITY_WEIGHT[getEffectivePriority(b)] - PRIORITY_WEIGHT[getEffectivePriority(a)]
        if (byPriority !== 0) return byPriority
      }
      if (sort === 'estimasi') {
        const byEstimate = Number(b.estimated_hours || 0) - Number(a.estimated_hours || 0)
        if (byEstimate !== 0) return byEstimate
      }
      return hoursUntilDeadline(a) - hoursUntilDeadline(b)
    })
  }, [tasks, filter, sort])

  const stats = useMemo(() => {
    const summary = { aktif: 0, darurat: 0, mendekati: 0, terlambat: 0, selesai: 0 }
    for (const task of tasks) {
      const urgency = getUrgency(task)
      if (urgency === 'selesai') summary.selesai += 1
      else {
        summary.aktif += 1
        if (isEmergency(task)) summary.darurat += 1
        if (urgency === 'mendekati') summary.mendekati += 1
        if (urgency === 'terlambat') summary.terlambat += 1
      }
    }
    return summary
  }, [tasks])

  const reminder = useStudyReminder(profile?.study_time, stats, tasks)

  const tonightPlan = useMemo(
    () =>
      planTonight(
        tasks,
        getAvailableTonightHours({
          sleepTime: profile?.sleep_time,
          session: reminder.session,
        }),
      ),
    [tasks, profile?.sleep_time, reminder.session],
  )

  const focusedTask = useMemo(
    () => tasks.find((task) => task.id === focusSession?.taskId) || null,
    [tasks, focusSession],
  )

  if (!isSupabaseConfigured) {
    return (
      <div className="bg-brutal-grid flex min-h-screen items-center justify-center p-4">
        <div className="card-insight w-full max-w-lg p-6">
          <h1 className="font-display text-[clamp(28px,4vw,40px)]">Supabase belum dikonfigurasi</h1>
          {supabaseConfigIssue && (
            <p className="brutal-border brutal-radius-sm mt-3 bg-brutal-orange px-3 py-2 font-bold">
              {supabaseConfigIssue}
            </p>
          )}
          <ol className="mt-4 list-decimal space-y-2 pl-5 font-bold">
            <li>
              Salin <code className="badge-brutal">.env.example</code> menjadi{' '}
              <code className="badge-brutal">.env</code>
            </li>
            <li>
              Isi <code className="badge-brutal">VITE_SUPABASE_URL</code> dan{' '}
              <code className="badge-brutal">VITE_SUPABASE_ANON_KEY</code> dari
              dashboard Supabase
            </li>
            <li>
              Jalankan SQL di{' '}
              <code className="badge-brutal">supabase/schema.sql</code> lewat SQL
              Editor Supabase
            </li>
            <li>Restart dev server</li>
          </ol>
        </div>
      </div>
    )
  }

  if (authLoading) {
    return (
      <div className="bg-brutal-grid flex min-h-screen items-center justify-center">
        <p className="caption-brutal">Memuat sesi…</p>
      </div>
    )
  }

  if (!session) {
    return <AuthForm />
  }

  if (passwordRecovery) {
    return <ResetPasswordForm onDone={() => setPasswordRecovery(false)} />
  }

  return (
    <div className="bg-brutal-grid min-h-dvh pb-[env(safe-area-inset-bottom,0px)]">
      <Header
        userName={profile?.name}
        userEmail={session.user.email}
        studyTime={profile?.study_time}
        session={reminder.session}
        permission={reminder.permission}
        onAddClick={openAddForm}
        onEditStudyTime={() => setStudyTimeFormOpen(true)}
        onLogout={handleLogout}
        onDeleteAccount={() => setDeleteAccountOpen(true)}
      />

      <main className="page-shell space-y-4 py-4 sm:space-y-8 sm:py-8">
        <DashboardStats stats={stats} onFilterChange={setFilter} />

        <TonightPlan
          plan={tonightPlan}
          sleepTime={profile?.sleep_time}
          onFocus={startFocus}
          onOpenTask={openEditForm}
        />

        <StudySessionBanner
          session={reminder.session}
          studyTime={profile?.study_time}
          focusTask={reminder.focusTask}
          dismissed={sessionDismissed && isSessionDismissedToday()}
          onFocusTask={() => startFocus(reminder.focusTask)}
          onDismiss={() => {
            setSessionDismissed(true)
            dismissStudySession()
          }}
        />

        <RitualBanner tasks={tasks} onFocus={startFocus} />

        {stats.darurat > 0 && filter !== 'darurat' && (
          <button
            type="button"
            onClick={() => setFilter('darurat')}
            className="card-cta brutal-press w-full px-4 py-4 text-left"
          >
            <span className="caption-brutal">Mode darurat 48 jam</span>
            <p className="mt-1 text-[clamp(20px,2.4vw,28px)] font-extrabold leading-tight">
              {stats.darurat} tugas harus selesai sebelum overshoot
            </p>
            <p className="mt-1 font-bold">Ketuk untuk fokus ke situ.</p>
          </button>
        )}

        <FilterBar
          filter={filter}
          onFilterChange={setFilter}
          sort={sort}
          onSortChange={setSort}
        />

        {error && (
          <div className="brutal-border brutal-radius-sm bg-brutal-orange px-4 py-3 font-bold">
            {error}
          </div>
        )}

        {loading ? (
          <p className="caption-brutal py-10 text-center">Memuat tugas…</p>
        ) : (
          <TaskList
            tasks={visibleTasks}
            onStatusChange={handleStatusChange}
            onEdit={openEditForm}
            onDelete={handleDelete}
            onFocus={startFocus}
            onRitualToggle={handleRitualToggle}
            onDeleteAttachment={handleDeleteAttachment}
          />
        )}
      </main>

      {formOpen && (
        <TaskForm
          initialTask={editingTask}
          existingAttachments={editingTask?.attachments || []}
          onSubmit={handleSubmitForm}
          onCancel={closeForm}
          onDeleteAttachment={handleDeleteAttachment}
        />
      )}

      {studyTimeFormOpen && (
        <StudyTimeForm
          currentTime={profile?.study_time}
          currentSleepTime={profile?.sleep_time}
          permission={reminder.permission}
          onSave={handleSaveStudyTime}
          onCancel={() => setStudyTimeFormOpen(false)}
          onTestReminder={reminder.sendTest}
          onRequestPermission={reminder.requestPermission}
        />
      )}

      {deleteAccountOpen && (
        <DeleteAccountModal
          userEmail={session.user.email}
          onConfirm={handleDeleteAccount}
          onCancel={() => setDeleteAccountOpen(false)}
        />
      )}

      {focusSession && focusedTask && (
        <FocusSession
          task={focusedTask}
          durationSec={focusSession.durationSec}
          startedAt={focusSession.startedAt}
          onAddTime={addFocusTime}
          onMarkDikerjakan={async () => {
            await handleStatusChange(focusedTask, 'dikerjakan')
            stopFocus()
          }}
          onClose={stopFocus}
        />
      )}
    </div>
  )
}
