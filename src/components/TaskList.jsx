import TaskItem from './TaskItem'

export default function TaskList({
  tasks,
  onStatusChange,
  onEdit,
  onDelete,
  onFocus,
  onRitualToggle,
  onDeleteAttachment,
}) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
        <p className="text-lg font-semibold text-slate-600">Tidak ada tugas</p>
        <p className="mt-1 text-sm text-slate-400">
          Tambahkan tugas baru atau ubah filter untuk melihat tugas lainnya.
        </p>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onStatusChange={onStatusChange}
          onEdit={onEdit}
          onDelete={onDelete}
          onFocus={onFocus}
          onRitualToggle={onRitualToggle}
          onDeleteAttachment={onDeleteAttachment}
        />
      ))}
    </ul>
  )
}
