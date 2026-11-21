// Requirement R4: write these two pure functions. No React in this file.
import type { Status, Task } from './taskReducer'

export type Filter = 'all' | Status

export const FILTERS: Filter[] = ['all', 'todo', 'in-progress', 'done']

/**
 * Return the tasks to show for the chosen filter.
 * 'all' returns every task; otherwise returns tasks matching the status.
 */
export function filterTasks(tasks: Task[], filter: Filter): Task[] {
  if (filter === 'all') {
    return tasks
  }
  return tasks.filter((t) => t.status === filter)
}

/**
 * Return how many tasks each filter button would show, for example { all: 3, todo: 1, ... }.
 */
export function countByFilter(tasks: Task[]): Record<Filter, number> {
  const counts: Record<Filter, number> = {
    all: tasks.length,
    todo: 0,
    'in-progress': 0,
    done: 0,
  }

  for (const task of tasks) {
    if (task.status === 'todo') {
      counts.todo += 1
    } else if (task.status === 'in-progress') {
      counts['in-progress'] += 1
    } else if (task.status === 'done') {
      counts.done += 1
    }
  }

  return counts
}
