import type { Task } from './taskReducer'

type TaskRowProps = {
  task: Task
  onNext: () => void
  onDelete: () => void
}

export default function TaskRow({ task, onNext, onDelete }: TaskRowProps) {
  const statusStyles: Record<Task['status'], { bg: string; text: string; border: string }> = {
    todo: { bg: '#e4eaf2', text: '#3c4d64', border: '#cbd5e1' },
    'in-progress': { bg: '#ffedc7', text: '#6e3c00', border: '#fcd34d' },
    done: { bg: '#d6f0de', text: '#115228', border: '#86efac' },
  }

  const badge = statusStyles[task.status]

  return (
    <li
      style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        padding: '10px 14px',
        backgroundColor: '#ffffff',
        border: '1px solid #d3dce8',
        borderRadius: '6px',
        marginBottom: '8px',
      }}
    >
      <span style={{ flex: 1, fontWeight: 500, color: '#1b2a41' }}>{task.title}</span>
      <span
        style={{
          display: 'inline-block',
          padding: '2px 10px',
          borderRadius: '12px',
          fontSize: '0.85rem',
          fontWeight: 600,
          backgroundColor: badge.bg,
          color: badge.text,
          border: `1px solid ${badge.border}`,
          textTransform: 'lowercase',
        }}
      >
        {task.status}
      </span>
      <button
        type="button"
        onClick={onNext}
        style={{
          padding: '5px 12px',
          fontSize: '0.85rem',
          backgroundColor: '#f1f5f9',
          color: '#1b2a41',
          border: '1px solid #cbd5e1',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Next
      </button>
      <button
        type="button"
        onClick={onDelete}
        style={{
          padding: '5px 12px',
          fontSize: '0.85rem',
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          border: '1px solid #fca5a5',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Delete
      </button>
    </li>
  )
}
