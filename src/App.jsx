import { useEffect, useMemo, useState } from 'react'
import { supabase, isSupabaseConfigured, supabaseConfigIssue } from './lib/supabaseClient'
import Header from './components/Header'
import DashboardStats from './components/DashboardStats'
import FilterBar from './components/FilterBar'
import TaskList from './components/TaskList'
import TaskForm from './components/TaskForm'
import AuthForm from './components/AuthForm'
import StudyTimeForm from './components/StudyTimeForm'
import { useStudyReminder } from './hooks/useStudyReminder'
import { PRIORITY_WEIGHT, getUrgency } from './utils/taskUtils'

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

  useEffect(() => {
    if (!isSupabaseConfigured) return

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setAuthLoading(false)
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
      .select('*')
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

    // fallback untuk akun yang dibuat sebelum trigger profil ada
    const { data: created, error: insertError } = await supabase
      .from('profiles')
      .insert({ id: userId })
      .select()
      .single()

    if (!insertError) setProfile(created)
  }

  async function handleSaveStudyTime(time) {
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({ study_time: time })
      .eq('id', session.user.id)
      .select()
      .single()

    if (updateError) {
      setError(`Gagal menyimpan jam belajar: ${updateError.message}`)
      return
    }
    setProfile(data)
    setStudyTimeFormOpen(false)
  }

  async function handleSubmitForm(formData) {
    if (editingTask) {
      const { data, error: updateError } = await supabase
        .from('tasks')
        .update(formData)
        .eq('id', editingTask.id)
        .select()
        .single()

      if (updateError) {
        setError(`Gagal menyimpan perubahan: ${updateError.message}`)
        return
      }
      setTasks((prev) => prev.map((task) => (task.id === data.id ? data : task)))
    } else {
      const { data, error: insertError } = await supabase
        .from('tasks')
        .insert(formData)
        .select()
        .single()

      if (insertError) {
        setError(`Gagal menambah tugas: ${insertError.message}`)
        return
      }
      setTasks((prev) => [data, ...prev])
    }
    closeForm()
  }

  async function handleToggleDone(task) {
    const { data, error: updateError } = await supabase
      .from('tasks')
      .update({ is_done: !task.is_done })
      .eq('id', task.id)
      .select()
      .single()

    if (updateError) {
      setError(`Gagal mengubah status: ${updateError.message}`)
      return
    }
    setTasks((prev) => prev.map((item) => (item.id === data.id ? data : item)))
  }

  async function handleDelete(task) {
    if (!window.confirm(`Hapus tugas "${task.title}"?`)) return

    const { error: deleteError } = await supabase.from('tasks').delete().eq('id', task.id)

    if (deleteError) {
      setError(`Gagal menghapus tugas: ${deleteError.message}`)
      return
    }
    setTasks((prev) => prev.filter((item) => item.id !== task.id))
  }

  async function handleLogout() {
    await supabase.auth.signOut()
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
      if (filter === 'belum') return !task.is_done
      if (filter === 'selesai') return task.is_done
      return true
    })

    return [...filtered].sort((a, b) => {
      if (a.is_done !== b.is_done) return a.is_done ? 1 : -1
      if (sort === 'prioritas') {
        const byPriority = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]
        if (byPriority !== 0) return byPriority
      }
      return a.deadline.localeCompare(b.deadline)
    })
  }, [tasks, filter, sort])

  const stats = useMemo(() => {
    const summary = { aktif: 0, mendekati: 0, terlambat: 0, selesai: 0 }
    for (const task of tasks) {
      const urgency = getUrgency(task)
      if (urgency === 'selesai') summary.selesai += 1
      else {
        summary.aktif += 1
        if (urgency === 'mendekati') summary.mendekati += 1
        if (urgency === 'terlambat') summary.terlambat += 1
      }
    }
    return summary
  }, [tasks])

  useStudyReminder(profile?.study_time, stats)

  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <h1 className="text-lg font-bold">Supabase belum dikonfigurasi</h1>
          {supabaseConfigIssue && (
            <p className="mt-3 rounded-lg border border-amber-300 bg-amber-100 px-3 py-2 text-sm font-medium">
              {supabaseConfigIssue}
            </p>
          )}
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
            <li>
              Salin <code className="rounded bg-amber-100 px-1">.env.example</code> menjadi{' '}
              <code className="rounded bg-amber-100 px-1">.env</code>
            </li>
            <li>
              Isi <code className="rounded bg-amber-100 px-1">VITE_SUPABASE_URL</code> dan{' '}
              <code className="rounded bg-amber-100 px-1">VITE_SUPABASE_ANON_KEY</code> dari
              dashboard Supabase
            </li>
            <li>
              Jalankan SQL di{' '}
              <code className="rounded bg-amber-100 px-1">supabase/schema.sql</code> lewat SQL
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
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-400">Memuat sesi…</p>
      </div>
    )
  }

  if (!session) {
    return <AuthForm />
  }

  return (
    <div className="min-h-screen">
      <Header
        userEmail={session.user.email}
        studyTime={profile?.study_time}
        onAddClick={openAddForm}
        onEditStudyTime={() => setStudyTimeFormOpen(true)}
        onLogout={handleLogout}
      />

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <DashboardStats stats={stats} />

        <FilterBar
          filter={filter}
          onFilterChange={setFilter}
          sort={sort}
          onSortChange={setSort}
        />

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="py-10 text-center text-sm text-slate-400">Memuat tugas…</p>
        ) : (
          <TaskList
            tasks={visibleTasks}
            onToggleDone={handleToggleDone}
            onEdit={openEditForm}
            onDelete={handleDelete}
          />
        )}
      </main>

      {formOpen && (
        <TaskForm initialTask={editingTask} onSubmit={handleSubmitForm} onCancel={closeForm} />
      )}

      {studyTimeFormOpen && (
        <StudyTimeForm
          currentTime={profile?.study_time}
          onSave={handleSaveStudyTime}
          onCancel={() => setStudyTimeFormOpen(false)}
        />
      )}
    </div>
  )
}
