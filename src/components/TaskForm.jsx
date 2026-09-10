import { useEffect, useState } from 'react'
import { PRIORITIES, PRIORITY_LABEL } from '../utils/taskUtils'

const EMPTY_FORM = {
  title: '',
  course: '',
  deadline: '',
  priority: 'sedang',
}

export default function TaskForm({ initialTask, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const isEdit = Boolean(initialTask)

  useEffect(() => {
    if (initialTask) {
      setForm({
        title: initialTask.title,
        course: initialTask.course,
        deadline: initialTask.deadline,
        priority: initialTask.priority,
      })
    }
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
    await onSubmit({
      title: form.title.trim(),
      course: form.course.trim(),
      deadline: form.deadline,
      priority: form.priority,
    })
    setSaving(false)
  }

  const inputClass = (hasError) =>
    `w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-indigo-500 ${
      hasError ? 'border-red-400' : 'border-slate-300'
    }`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-800">
          {isEdit ? 'Edit Tugas' : 'Tambah Tugas Baru'}
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
          <div>
            <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-700">
              Nama Tugas
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="cth: Laporan Praktikum Modul 3"
              className={inputClass(errors.title)}
            />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="course" className="mb-1 block text-sm font-medium text-slate-700">
              Mata Kuliah
            </label>
            <input
              id="course"
              name="course"
              type="text"
              value={form.course}
              onChange={handleChange}
              placeholder="cth: Pemrograman Web"
              className={inputClass(errors.course)}
            />
            {errors.course && <p className="mt-1 text-xs text-red-600">{errors.course}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="deadline" className="mb-1 block text-sm font-medium text-slate-700">
                Deadline
              </label>
              <input
                id="deadline"
                name="deadline"
                type="date"
                value={form.deadline}
                onChange={handleChange}
                className={inputClass(errors.deadline)}
              />
              {errors.deadline && (
                <p className="mt-1 text-xs text-red-600">{errors.deadline}</p>
              )}
            </div>
            <div>
              <label htmlFor="priority" className="mb-1 block text-sm font-medium text-slate-700">
                Prioritas
              </label>
              <select
                id="priority"
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className={inputClass(false)}
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {PRIORITY_LABEL[priority]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
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
