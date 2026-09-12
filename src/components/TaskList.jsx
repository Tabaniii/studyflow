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
      <div className="card-brutal p-10 text-center">
        <p className="font-display text-[clamp(24px,3vw,40px)]">Tidak ada tugas</p>
        <p className="mt-2 font-bold">
          Tambahkan tugas baru atau ubah filter untuk melihat tugas lainnya.
        </p>
      </div>
    )
  }

  return (
    <ul className="space-y-4 pb-2 pr-2">
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
