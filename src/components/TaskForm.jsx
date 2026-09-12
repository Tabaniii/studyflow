import { useEffect, useState } from 'react'
import {
  ANNOUNCED_VIA,
  ANNOUNCED_VIA_LABEL,
  FILE_FORMATS,
  FILE_FORMAT_LABEL,
  PRIORITIES,
  PRIORITY_LABEL,
  RECURRENCES,
  RECURRENCE_LABEL,
  STATUSES,
  STATUS_LABEL,
  SUBMIT_VIA,
  SUBMIT_VIA_LABEL,
  TASK_TYPES,
  TASK_TYPE_LABEL,
  getEffectivePriority,
} from '../utils/taskUtils'
import { attachmentError } from '../lib/attachments'
import AttachmentThumbs from './AttachmentThumbs'

const EMPTY_FORM = {
  title: '',
  course: '',
  deadline: '',
  deadline_time: '23:59',
  priority: 'sedang',
  estimated_hours: '',
  status: 'belum_mulai',
  description: '',
  announced_via: 'wa',
  source_link: '',
  submit_via: 'lms',
  file_format: 'pdf',
  task_type: 'individu',
  members: '',
  pic_name: '',
  recurrence: 'tidak',
}

export default function TaskForm({
  initialTask,
  existingAttachments = [],
  onSubmit,
  onCancel,
  onDeleteAttachment,
}) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [pendingFiles, setPendingFiles] = useState([])
  const [fileError, setFileError] = useState(null)

  const isEdit = Boolean(initialTask)

  useEffect(() => {
    if (!initialTask) return
    setForm({
      title: initialTask.title ?? '',
      course: initialTask.course ?? '',
      deadline: initialTask.deadline ?? '',
      deadline_time: String(initialTask.deadline_time || '23:59').slice(0, 5),
      priority: getEffectivePriority(initialTask),
      estimated_hours:
        initialTask.estimated_hours == null ? '' : String(initialTask.estimated_hours),
      status: initialTask.status || (initialTask.is_done ? 'dikumpul' : 'belum_mulai'),
      description: initialTask.description ?? '',
      announced_via: initialTask.announced_via || 'lainnya',
      source_link: initialTask.source_link ?? '',
      submit_via: initialTask.submit_via || 'lms',
      file_format: initialTask.file_format || 'bebas',
      task_type: initialTask.task_type || 'individu',
      members: initialTask.members ?? '',
      pic_name: initialTask.pic_name ?? '',
      recurrence: initialTask.recurrence || 'tidak',
    })
  }, [initialTask])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function validate() {
    const next = {}
    if (!form.title.trim()) next.title = 'Nama tugas wajib diisi'
    if (!form.course.trim()) next.course = 'Mata kuliah wajib diisi'
    if (!form.deadline) next.deadline = 'Deadline wajib diisi'
    if (!form.deadline_time) next.deadline_time = 'Jam kumpul wajib diisi'
    if (form.estimated_hours !== '') {
      const hours = Number(form.estimated_hours)
      if (!Number.isFinite(hours) || hours < 0) next.estimated_hours = 'Estimasi tidak valid'
    }
    if (form.source_link.trim() && !/^https?:\/\//i.test(form.source_link.trim())) {
      next.source_link = 'Pakai tautan lengkap, mulai dengan http:// atau https://'
    }
    if (form.task_type === 'kelompok' && !form.members.trim()) {
      next.members = 'Isi anggota kelompok, pisahkan dengan koma'
    }
    return next
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }
    setSaving(true)
    await onSubmit(form, pendingFiles)
    setSaving(false)
  }

  function handleFiles(event) {
    const files = Array.from(event.target.files || [])
    const nextError = files.map(attachmentError).find(Boolean)
    if (nextError) {
      setFileError(nextError)
      event.target.value = ''
      return
    }
    setFileError(null)
    setPendingFiles((prev) => [...prev, ...files])
    event.target.value = ''
  }

  const inputClass = (hasError) =>
    `w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-indigo-500 ${
      hasError ? 'border-red-400' : 'border-slate-300'
    }`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-800">
            {isEdit ? 'Edit Tugas' : 'Tambah Tugas Baru'}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Simpan konteks lengkap supaya tidak perlu buka grup lagi saat ngerjain.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-4" noValidate>
          <Section title="Inti tugas">
            <Field label="Nama Tugas" htmlFor="title" error={errors.title}>
              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="cth: Laporan Praktikum Modul 3"
                className={inputClass(errors.title)}
              />
            </Field>
            <Field label="Mata Kuliah" htmlFor="course" error={errors.course}>
              <input
                id="course"
                name="course"
                type="text"
                value={form.course}
                onChange={handleChange}
                placeholder="cth: Pemrograman Web"
                className={inputClass(errors.course)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tanggal deadline" htmlFor="deadline" error={errors.deadline}>
                <input
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={form.deadline}
                  onChange={handleChange}
                  className={inputClass(errors.deadline)}
                />
              </Field>
              <Field label="Jam kumpul" htmlFor="deadline_time" error={errors.deadline_time}>
                <input
                  id="deadline_time"
                  name="deadline_time"
                  type="time"
                  value={form.deadline_time}
                  onChange={handleChange}
                  className={inputClass(errors.deadline_time)}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Prioritas"
                htmlFor="priority"
                hint="Seberapa penting tugas ini menurutmu: rendah, sedang, atau tinggi."
              >
                <select
                  id="priority"
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className={inputClass(false)}
                >
                  {PRIORITIES.map((value) => (
                    <option key={value} value={value}>
                      {PRIORITY_LABEL[value]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label="Estimasi pengerjaan (jam)"
                htmlFor="estimated_hours"
                error={errors.estimated_hours}
              >
                <input
                  id="estimated_hours"
                  name="estimated_hours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={form.estimated_hours}
                  onChange={handleChange}
                  placeholder="cth: 4"
                  className={inputClass(errors.estimated_hours)}
                />
              </Field>
            </div>
            {isEdit && (
              <Field label="Status" htmlFor="status">
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className={inputClass(false)}
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABEL[status]}
                    </option>
                  ))}
                </select>
              </Field>
            )}
          </Section>

          <Section title="Konteks & pengumpulan">
            <Field
              label="Instruksi dosen / deskripsi"
              htmlFor="description"
              hint="Syarat, jumlah halaman, yang dikumpul, dll."
            >
              <textarea
                id="description"
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                placeholder="cth: PDF max 10 hlm, cover + daftar pustaka, kumpul per kelompok"
                className={inputClass(false)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Diumumkan di" htmlFor="announced_via">
                <select
                  id="announced_via"
                  name="announced_via"
                  value={form.announced_via}
                  onChange={handleChange}
                  className={inputClass(false)}
                >
                  {ANNOUNCED_VIA.map((value) => (
                    <option key={value} value={value}>
                      {ANNOUNCED_VIA_LABEL[value]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Kumpul ke" htmlFor="submit_via">
                <select
                  id="submit_via"
                  name="submit_via"
                  value={form.submit_via}
                  onChange={handleChange}
                  className={inputClass(false)}
                >
                  {SUBMIT_VIA.map((value) => (
                    <option key={value} value={value}>
                      {SUBMIT_VIA_LABEL[value]}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Format file" htmlFor="file_format">
                <select
                  id="file_format"
                  name="file_format"
                  value={form.file_format}
                  onChange={handleChange}
                  className={inputClass(false)}
                >
                  {FILE_FORMATS.map((value) => (
                    <option key={value} value={value}>
                      {FILE_FORMAT_LABEL[value]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tautan sumber" htmlFor="source_link" error={errors.source_link}>
                <input
                  id="source_link"
                  name="source_link"
                  type="url"
                  value={form.source_link}
                  onChange={handleChange}
                  placeholder="https://classroom.google.com/..."
                  className={inputClass(errors.source_link)}
                />
              </Field>
            </div>
          </Section>

          <Section title="Tipe tugas">
            <Field label="Individu / kelompok" htmlFor="task_type">
              <select
                id="task_type"
                name="task_type"
                value={form.task_type}
                onChange={handleChange}
                className={inputClass(false)}
              >
                {TASK_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {TASK_TYPE_LABEL[value]}
                  </option>
                ))}
              </select>
            </Field>
            {form.task_type === 'kelompok' && (
              <>
                <Field
                  label="Anggota kelompok"
                  htmlFor="members"
                  error={errors.members}
                  hint="Pisahkan nama dengan koma"
                >
                  <input
                    id="members"
                    name="members"
                    type="text"
                    value={form.members}
                    onChange={handleChange}
                    placeholder="Andi, Budi, Citra"
                    className={inputClass(errors.members)}
                  />
                </Field>
                <Field label="PIC pengumpulan" htmlFor="pic_name">
                  <input
                    id="pic_name"
                    name="pic_name"
                    type="text"
                    value={form.pic_name}
                    onChange={handleChange}
                    placeholder="Siapa yang upload / kumpul"
                    className={inputClass(false)}
                  />
                </Field>
              </>
            )}
          </Section>

          <Section title="Lampiran instruksi">
            <p className="text-xs text-slate-500">
              Simpan screenshot WA, foto papan tulis, atau PDF soal. Tidak diparse — cuma biar gampang dibuka lagi.
            </p>
            <AttachmentThumbs attachments={existingAttachments} onDelete={onDeleteAttachment} />
            {pendingFiles.length > 0 && (
              <ul className="text-xs text-slate-600">
                {pendingFiles.map((file, index) => (
                  <li key={`${file.name}-${index}`}>Siap diunggah: {file.name}</li>
                ))}
              </ul>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
              multiple
              onChange={handleFiles}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-indigo-700"
            />
            {fileError && <p className="text-xs text-red-600">{fileError}</p>}
          </Section>

          <Section title="Pengulangan">
            <Field
              label="Tugas berulang"
              htmlFor="recurrence"
              hint="Kalau sudah dikumpul, tugas berikutnya dibuat otomatis."
            >
              <select
                id="recurrence"
                name="recurrence"
                value={form.recurrence}
                onChange={handleChange}
                className={inputClass(false)}
              >
                {RECURRENCES.map((value) => (
                  <option key={value} value={value}>
                    {RECURRENCE_LABEL[value]}
                  </option>
                ))}
              </select>
            </Field>
          </Section>

          <div className="sticky bottom-0 -mx-6 mt-2 flex justify-end gap-2 border-t border-slate-100 bg-white px-6 py-4">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Tambah Tugas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="mb-5 space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{title}</h3>
      {children}
    </section>
  )
}

function Field({ label, htmlFor, error, hint, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
