import { useReducer, useRef } from 'react'
import { taskReducer, initialState, type Task, type Action } from './taskReducer'
import { filterTasks, countByFilter, FILTERS, type Filter } from './filter'
import TaskRow from './TaskRow'
import type { Dispatch } from 'react'

const FILTER_LABELS: Record<Filter, string> = {
  all: 'All',
  todo: 'To do',
  'in-progress': 'In progress',
  done: 'Done',
}

function AddForm({ dispatch }: { dispatch: Dispatch<Action> }) {
  const formRef = useRef<HTMLFormElement>(null)

  function addTask(formData: FormData) {
    const title = String(formData.get('title') ?? '').trim()
    if (title) {
      dispatch({ type: 'add', id: crypto.randomUUID(), title })
      formRef.current?.reset()
    }
  }

  return (
    <form
      ref={formRef}
      action={addTask}
      style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
      }}
    >
      <input
        name="title"
        placeholder="New task"
        style={{
          flex: 1,
          padding: '8px 12px',
          fontSize: '1rem',
          border: '1px solid #d3dce8',
          borderRadius: '6px',
        }}
      />
      <button
        type="submit"
        style={{
          padding: '8px 16px',
          fontSize: '1rem',
          backgroundColor: '#1a58a5',
          color: '#ffffff',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Add
      </button>
    </form>
  )
}

function FilterBar({
  currentFilter,
  counts,
  dispatch,
}: {
  currentFilter: Filter
  counts: Record<Filter, number>
  dispatch: Dispatch<Action>
}) {
  return (
    <nav
      aria-label="Filter tasks"
      style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        flexWrap: 'wrap',
      }}
    >
      {FILTERS.map((f) => {
        const isActive = currentFilter === f
        return (
          <button
            key={f}
            type="button"
            onClick={() => dispatch({ type: 'setFilter', filter: f })}
            style={{
              padding: '6px 14px',
              fontSize: '0.9rem',
              fontWeight: isActive ? 700 : 500,
              backgroundColor: isActive ? '#1a58a5' : '#f1f5f9',
              color: isActive ? '#ffffff' : '#1b2a41',
              border: isActive ? '1px solid #1a58a5' : '1px solid #d3dce8',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {FILTER_LABELS[f]} ({counts[f]})
          </button>
        )
      })}
    </nav>
  )
}

function TaskList({
  tasks,
  dispatch,
}: {
  tasks: Task[]
  dispatch: Dispatch<Action>
}) {
  return (
    <ul
      style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
      }}
    >
      {tasks.map((t) => (
        <TaskRow
          key={t.id}
          task={t}
          onNext={() => dispatch({ type: 'advance', id: t.id })}
          onDelete={() => dispatch({ type: 'remove', id: t.id })}
        />
      ))}
    </ul>
  )
}

export default function App() {
  const [state, dispatch] = useReducer(taskReducer, initialState)

  // Derived state: computed live on each render, never stored redundantly in state
  const counts = countByFilter(state.tasks)
  const visibleTasks = filterTasks(state.tasks, state.filter)

  return (
    <main
      style={{
        maxWidth: '560px',
        margin: '40px auto',
        padding: '24px',
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <h1
        style={{
          marginTop: 0,
          marginBottom: '20px',
          color: '#1b2a41',
          fontSize: '1.75rem',
        }}
      >
        Task Manager
      </h1>

      <AddForm dispatch={dispatch} />

      <FilterBar
        currentFilter={state.filter}
        counts={counts}
        dispatch={dispatch}
      />

      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
        }}
      >
        <button
          type="button"
          onClick={() => dispatch({ type: 'clearDone' })}
          style={{
            padding: '6px 14px',
            fontSize: '0.9rem',
            backgroundColor: '#f1f5f9',
            color: '#1b2a41',
            border: '1px solid #d3dce8',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Clear done
        </button>

        <button
          type="button"
          onClick={() => dispatch({ type: 'undo' })}
          disabled={state.past.length === 0}
          style={{
            padding: '6px 14px',
            fontSize: '0.9rem',
            backgroundColor: state.past.length === 0 ? '#f8fafc' : '#f1f5f9',
            color: state.past.length === 0 ? '#94a3b8' : '#1b2a41',
            border: '1px solid #d3dce8',
            borderRadius: '6px',
            cursor: state.past.length === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          Undo
        </button>
      </div>

      {visibleTasks.length === 0 ? (
        <p
          style={{
            fontStyle: 'italic',
            color: '#64748b',
            padding: '16px 0',
            textAlign: 'center',
            backgroundColor: '#f8fafc',
            borderRadius: '6px',
            border: '1px dashed #cbd5e1',
          }}
        >
          No tasks here.
        </p>
      ) : (
        <TaskList tasks={visibleTasks} dispatch={dispatch} />
      )}
    </main>
  )
}
