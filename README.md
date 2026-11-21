# MIS 233 Assignment 3: Task Manager with a Reducer

**Full Name:** Ahmet Akif Öcal  
**Student Number:** 2025502180  
**Course:** MIS 233 Web Based Application Programming (Fall 2026)  
**Instructor:** Boğaziçi University  

---

## Overview

A robust, type-safe React + TypeScript Task Manager built using `useReducer`. The application manages task lifecycles (`todo`, `in-progress`, `done`), provides a multi-state filter bar with live derived counts, supports bulk actions like `clearDone`, and includes an immutable Undo history stack.

### Getting Started

Prerequisites: Node.js 20.19+ (v22 / v24 / v26 supported).

```bash
npm install
npm run dev     # starts local Vite development server
npm run build   # type-checks with tsc in strict mode and builds production bundle
npm test        # executes Vitest automated unit test suite
```

---

## Bonus 1: Undo

The application state shape is defined as `{ tasks: Task[]; filter: Filter; past: Task[][] }`, where `past` acts as an immutable history stack that stores snapshots of previous task lists. Every reducer action that modifies the task collection (`add`, `advance`, `remove`, `clearDone`) prepends or pushes the existing `state.tasks` array onto `past`, while filter changes leave `past` untouched because changing the active view does not alter the underlying data. When the `undo` action is dispatched, the reducer pops the most recent task list from `past` and restores it as the active `tasks`, with the Undo button remaining disabled whenever `past` is empty.

---

## Bonus 2: Tests

Automated unit tests are implemented using Vitest. The test suite thoroughly validates every reducer action (`add`, `advance`, `remove`, `setFilter`, `clearDone`, `undo`), cyclic advancement returning to `todo`, immutability guarantees via `Object.freeze`, edge cases (unknown task IDs, empty arrays, `clearDone` with nothing completed, empty undo stack), and pure filter utilities (`filterTasks`, `countByFilter`).

Test execution output (`npm test`):

```
> task-manager-assignment3@0.0.0 test
> vitest run

 RUN  v5.1.1 /Users/ahmokif/Desktop/EkranResimleri/MIS 233 ödev/starter

 ✓ src/filter.test.ts (10 tests) 2ms
 ✓ src/taskReducer.test.ts (15 tests) 3ms

 Test Files  2 passed (2)
      Tests  25 passed (25)
   Start at  10:44:32
   Duration  87ms (transform 61%, import 21%, tests 12%, worker 6%)
```

---

## Bonus 3: Explain your reducer

A reducer must be a pure function because React relies on shallow reference equality checks (`Object.is`) to detect state changes and schedule re-renders. If a reducer mutates the old state object directly instead of returning a fresh copy, React observes the exact same object reference in memory and skips re-rendering the component tree. This mutation leaves the UI stale, breaks features like time-travel debugging and undo history, and causes subtle, non-deterministic bugs across components.

The caller creates the task `id` (using `crypto.randomUUID()`) outside the reducer so that the reducer remains completely deterministic. If a reducer generated random IDs or timestamps internally, calling it twice with identical arguments would produce different results, violating functional purity and rendering automated unit tests unreliable. Generating the ID in the caller keeps the reducer predictable and reproducible.

The filtered task list and status counts are computed as derived state during render rather than persisted in the reducer state to maintain a single source of truth. Storing redundant copies in state introduces data synchronization risks: for instance, if a user filters by "In progress" and deletes or advances a task, a separately stored `filteredTasks` or cached `counts` array could easily become out of sync with `tasks`, displaying inaccurate counts or deleted tasks still lingering on screen. Deriving them dynamically via pure functions guarantees that counts and visible tasks always reflect the current task list.

Moving the filter into the reducer state instead of using an independent `useState` made coordinating multi-field actions cleaner, as the entire application state is governed holistically by one central reducer. However, it made simple UI interactions slightly more verbose, requiring a formal action object dispatch (`{ type: 'setFilter', filter }`) and an additional switch branch rather than a direct state setter call.

---

## Bonus 4: Git repository

https://github.com/Ahmedovac/mis233-assignment3

The repository contains a clean step-by-step commit history with meaningful commit messages illustrating the incremental progression of the solution, complete with `.gitignore`, all test suites, and screenshots.

---

## Screenshots

The four required screenshots illustrating each filter state with live derived counts are stored under the `screenshots/` directory:

- `screenshots/all.png`: Showing All (3), To do (1), In progress (1), Done (1) with all three tasks displayed.
- `screenshots/todo.png`: Filtered view showing the single active task in "todo".
- `screenshots/in-progress.png`: Filtered view showing the single task in "in-progress".
- `screenshots/done.png`: Filtered view showing the single task in "done".
