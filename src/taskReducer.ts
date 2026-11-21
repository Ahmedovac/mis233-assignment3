// Full Name: Ahmet Akif Öcal
// Student Number: 2025502180
// MIS 233 - Assignment 3: Task Manager with a Reducer

import type { Filter } from './filter'

export type Status = 'todo' | 'in-progress' | 'done'
export type Task = { id: string; title: string; status: Status }

export type State = {
  tasks: Task[]
  filter: Filter
  past: Task[][]
}

export type Action =
  | { type: 'add'; id: string; title: string }
  | { type: 'advance'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'setFilter'; filter: Filter }
  | { type: 'clearDone' }
  | { type: 'undo' }

export const initialState: State = {
  tasks: [],
  filter: 'all',
  past: [],
}

const NEXT: Record<Status, Status> = {
  todo: 'in-progress',
  'in-progress': 'done',
  done: 'todo',
}

export function taskReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add': {
      return {
        ...state,
        past: [...state.past, state.tasks],
        tasks: [
          ...state.tasks,
          { id: action.id, title: action.title, status: 'todo' },
        ],
      }
    }
    case 'advance': {
      const taskExists = state.tasks.some((t) => t.id === action.id)
      if (!taskExists) {
        return state
      }
      return {
        ...state,
        past: [...state.past, state.tasks],
        tasks: state.tasks.map((t) =>
          t.id === action.id ? { ...t, status: NEXT[t.status] } : t,
        ),
      }
    }
    case 'remove': {
      const taskExists = state.tasks.some((t) => t.id === action.id)
      if (!taskExists) {
        return state
      }
      return {
        ...state,
        past: [...state.past, state.tasks],
        tasks: state.tasks.filter((t) => t.id !== action.id),
      }
    }
    case 'setFilter': {
      if (state.filter === action.filter) {
        return state
      }
      return {
        ...state,
        filter: action.filter,
      }
    }
    case 'clearDone': {
      const hasDone = state.tasks.some((t) => t.status === 'done')
      if (!hasDone) {
        return state
      }
      return {
        ...state,
        past: [...state.past, state.tasks],
        tasks: state.tasks.filter((t) => t.status !== 'done'),
      }
    }
    case 'undo': {
      if (state.past.length === 0) {
        return state
      }
      const previousTasks = state.past[state.past.length - 1]
      const newPast = state.past.slice(0, -1)
      return {
        ...state,
        tasks: previousTasks,
        past: newPast,
      }
    }
    default: {
      const _exhaustiveCheck: never = action
      return _exhaustiveCheck
    }
  }
}
