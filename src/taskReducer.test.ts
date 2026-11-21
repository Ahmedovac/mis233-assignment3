import { describe, it, expect } from 'vitest'
import {
  taskReducer,
  initialState,
  type State,
  type Task,
} from './taskReducer'

describe('taskReducer', () => {
  it('has valid initial state', () => {
    expect(initialState).toEqual({
      tasks: [],
      filter: 'all',
      past: [],
    })
  })

  it('handles add action', () => {
    const action = { type: 'add' as const, id: '1', title: 'Task 1' }
    const nextState = taskReducer(initialState, action)

    expect(nextState.tasks).toHaveLength(1)
    expect(nextState.tasks[0]).toEqual({
      id: '1',
      title: 'Task 1',
      status: 'todo',
    })
    expect(nextState.past).toHaveLength(1)
    expect(nextState.past[0]).toEqual([])
  })

  it('advances a task through todo -> in-progress -> done -> todo (three advances)', () => {
    const s0: State = {
      tasks: [{ id: '1', title: 'Study', status: 'todo' }],
      filter: 'all',
      past: [],
    }

    // 1st advance: todo -> in-progress
    const s1 = taskReducer(s0, { type: 'advance', id: '1' })
    expect(s1.tasks[0].status).toBe('in-progress')
    expect(s1.past).toHaveLength(1)
    expect(s1.past[0]).toEqual(s0.tasks)

    // 2nd advance: in-progress -> done
    const s2 = taskReducer(s1, { type: 'advance', id: '1' })
    expect(s2.tasks[0].status).toBe('done')
    expect(s2.past).toHaveLength(2)

    // 3rd advance: done -> todo (wraps back)
    const s3 = taskReducer(s2, { type: 'advance', id: '1' })
    expect(s3.tasks[0].status).toBe('todo')
    expect(s3.past).toHaveLength(3)
  })

  it('does nothing when advancing an unknown task id', () => {
    const s0: State = {
      tasks: [{ id: '1', title: 'Task 1', status: 'todo' }],
      filter: 'all',
      past: [],
    }
    const s1 = taskReducer(s0, { type: 'advance', id: 'unknown-id' })
    expect(s1).toBe(s0)
    expect(s1.tasks).toEqual(s0.tasks)
    expect(s1.past).toHaveLength(0)
  })

  it('removes an existing task and records previous state in past', () => {
    const s0: State = {
      tasks: [
        { id: '1', title: 'Task 1', status: 'todo' },
        { id: '2', title: 'Task 2', status: 'done' },
      ],
      filter: 'all',
      past: [],
    }
    const s1 = taskReducer(s0, { type: 'remove', id: '1' })
    expect(s1.tasks).toEqual([{ id: '2', title: 'Task 2', status: 'done' }])
    expect(s1.past).toEqual([s0.tasks])
  })

  it('does nothing when removing an unknown task id', () => {
    const s0: State = {
      tasks: [{ id: '1', title: 'Task 1', status: 'todo' }],
      filter: 'all',
      past: [],
    }
    const s1 = taskReducer(s0, { type: 'remove', id: 'non-existent' })
    expect(s1).toBe(s0)
    expect(s1.tasks).toHaveLength(1)
    expect(s1.past).toHaveLength(0)
  })

  it('handles setFilter action without modifying tasks or pushing to past', () => {
    const s0: State = {
      tasks: [{ id: '1', title: 'Task 1', status: 'todo' }],
      filter: 'all',
      past: [],
    }
    const s1 = taskReducer(s0, { type: 'setFilter', filter: 'done' })
    expect(s1.filter).toBe('done')
    expect(s1.tasks).toBe(s0.tasks)
    expect(s1.past).toEqual([]) // filter changes are not undoable
  })

  it('returns same state when setting the already active filter', () => {
    const s0: State = {
      tasks: [{ id: '1', title: 'Task 1', status: 'todo' }],
      filter: 'todo',
      past: [],
    }
    const s1 = taskReducer(s0, { type: 'setFilter', filter: 'todo' })
    expect(s1).toBe(s0)
  })

  it('clears all tasks with done status and keeps other tasks and filter', () => {
    const s0: State = {
      tasks: [
        { id: '1', title: 'Task 1', status: 'todo' },
        { id: '2', title: 'Task 2', status: 'done' },
        { id: '3', title: 'Task 3', status: 'in-progress' },
        { id: '4', title: 'Task 4', status: 'done' },
      ],
      filter: 'all',
      past: [],
    }
    const s1 = taskReducer(s0, { type: 'clearDone' })
    expect(s1.tasks).toEqual([
      { id: '1', title: 'Task 1', status: 'todo' },
      { id: '3', title: 'Task 3', status: 'in-progress' },
    ])
    expect(s1.past).toEqual([s0.tasks])
    expect(s1.filter).toBe('all')
  })

  it('clearDone with nothing done returns state unchanged', () => {
    const s0: State = {
      tasks: [
        { id: '1', title: 'Task 1', status: 'todo' },
        { id: '2', title: 'Task 2', status: 'in-progress' },
      ],
      filter: 'all',
      past: [],
    }
    const s1 = taskReducer(s0, { type: 'clearDone' })
    expect(s1).toBe(s0)
    expect(s1.past).toHaveLength(0)
  })

  it('clearDone on empty task list returns state unchanged', () => {
    const s0: State = {
      tasks: [],
      filter: 'todo',
      past: [],
    }
    const s1 = taskReducer(s0, { type: 'clearDone' })
    expect(s1).toBe(s0)
  })

  it('handles undo correctly: pops the last task list and reverts tasks', () => {
    const initialTasks: Task[] = [{ id: '1', title: 'Task 1', status: 'todo' }]
    const s0: State = {
      tasks: initialTasks,
      filter: 'all',
      past: [],
    }

    const s1 = taskReducer(s0, { type: 'add', id: '2', title: 'Task 2' })
    expect(s1.tasks).toHaveLength(2)
    expect(s1.past).toHaveLength(1)

    const s2 = taskReducer(s1, { type: 'undo' })
    expect(s2.tasks).toEqual(initialTasks)
    expect(s2.past).toEqual([])
  })

  it('undo does nothing when past is empty', () => {
    const s0: State = {
      tasks: [{ id: '1', title: 'Task 1', status: 'todo' }],
      filter: 'all',
      past: [],
    }
    const s1 = taskReducer(s0, { type: 'undo' })
    expect(s1).toBe(s0)
    expect(s1.tasks).toBe(s0.tasks)
  })

  it('undo after clearDone restores all cleared tasks', () => {
    const initialTasks: Task[] = [
      { id: '1', title: 'Task 1', status: 'todo' },
      { id: '2', title: 'Task 2', status: 'done' },
    ]
    const s0: State = {
      tasks: initialTasks,
      filter: 'all',
      past: [],
    }
    const s1 = taskReducer(s0, { type: 'clearDone' })
    expect(s1.tasks).toHaveLength(1)
    expect(s1.tasks[0].id).toBe('1')

    const s2 = taskReducer(s1, { type: 'undo' })
    expect(s2.tasks).toEqual(initialTasks)
  })

  it('maintains pure immutability: does not mutate old state (tested with Object.freeze)', () => {
    const s0: State = Object.freeze({
      tasks: Object.freeze([
        Object.freeze({ id: '1', title: 'Frozen 1', status: 'todo' as const }),
        Object.freeze({ id: '2', title: 'Frozen 2', status: 'in-progress' as const }),
      ]) as unknown as Task[],
      filter: 'all' as const,
      past: Object.freeze([]) as unknown as Task[][],
    })

    // Advance task without mutating frozen objects
    expect(() => taskReducer(s0, { type: 'advance', id: '1' })).not.toThrow()
    const advanced = taskReducer(s0, { type: 'advance', id: '1' })
    expect(advanced).not.toBe(s0)
    expect(advanced.tasks).not.toBe(s0.tasks)
    expect(advanced.tasks[0].status).toBe('in-progress')
    // Original s0 is untouched
    expect(s0.tasks[0].status).toBe('todo')

    // Add task without mutating frozen state
    expect(() =>
      taskReducer(s0, { type: 'add', id: '3', title: 'Frozen 3' }),
    ).not.toThrow()

    // Remove task without mutating frozen state
    expect(() => taskReducer(s0, { type: 'remove', id: '2' })).not.toThrow()

    // Set filter without mutating frozen state
    expect(() =>
      taskReducer(s0, { type: 'setFilter', filter: 'done' }),
    ).not.toThrow()
  })
})
