import { describe, it, expect } from 'vitest'
import { filterTasks, countByFilter, FILTERS } from './filter'
import type { Task } from './taskReducer'

describe('filter utilities', () => {
  const sampleTasks: Task[] = [
    { id: '1', title: 'Task 1', status: 'todo' },
    { id: '2', title: 'Task 2', status: 'in-progress' },
    { id: '3', title: 'Task 3', status: 'done' },
    { id: '4', title: 'Task 4', status: 'todo' },
  ]

  describe('FILTERS array', () => {
    it('contains all 4 filters in correct order', () => {
      expect(FILTERS).toEqual(['all', 'todo', 'in-progress', 'done'])
    })
  })

  describe('filterTasks', () => {
    it('returns all tasks when filter is "all"', () => {
      const result = filterTasks(sampleTasks, 'all')
      expect(result).toEqual(sampleTasks)
      expect(result).toHaveLength(4)
    })

    it('returns only todo tasks when filter is "todo"', () => {
      const result = filterTasks(sampleTasks, 'todo')
      expect(result).toEqual([
        { id: '1', title: 'Task 1', status: 'todo' },
        { id: '4', title: 'Task 4', status: 'todo' },
      ])
    })

    it('returns only in-progress tasks when filter is "in-progress"', () => {
      const result = filterTasks(sampleTasks, 'in-progress')
      expect(result).toEqual([
        { id: '2', title: 'Task 2', status: 'in-progress' },
      ])
    })

    it('returns only done tasks when filter is "done"', () => {
      const result = filterTasks(sampleTasks, 'done')
      expect(result).toEqual([
        { id: '3', title: 'Task 3', status: 'done' },
      ])
    })

    it('returns empty array when tasks list is empty', () => {
      expect(filterTasks([], 'all')).toEqual([])
      expect(filterTasks([], 'todo')).toEqual([])
      expect(filterTasks([], 'in-progress')).toEqual([])
      expect(filterTasks([], 'done')).toEqual([])
    })

    it('returns empty array when no tasks match the filter', () => {
      const onlyTodo: Task[] = [{ id: '1', title: 'Only Todo', status: 'todo' }]
      expect(filterTasks(onlyTodo, 'done')).toEqual([])
    })
  })

  describe('countByFilter', () => {
    it('accurately counts tasks for each category', () => {
      const counts = countByFilter(sampleTasks)
      expect(counts).toEqual({
        all: 4,
        todo: 2,
        'in-progress': 1,
        done: 1,
      })
    })

    it('returns zero for all categories with empty list', () => {
      const counts = countByFilter([])
      expect(counts).toEqual({
        all: 0,
        todo: 0,
        'in-progress': 0,
        done: 0,
      })
    })

    it('updates counts correctly after task deletion or advancement', () => {
      const remainingTasks = sampleTasks.filter((t) => t.id !== '1')
      const counts = countByFilter(remainingTasks)
      expect(counts).toEqual({
        all: 3,
        todo: 1,
        'in-progress': 1,
        done: 1,
      })
    })
  })
})
