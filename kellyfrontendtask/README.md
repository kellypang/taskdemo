# Frontend (Task Dashboard)

**✅ CRUD Interface** with React + Vite providing interactive task management UI.

## ✅ Features

**Core Operations:**

- ✅ **Create Tasks**: Interactive form with validation (title, description, due date, status)
- ✅ **Read/Display Tasks**: Sortable table with real-time updates and task details panel
- ✅ **Update Tasks**: Inline editing with full-field updates + quick status changes
- ✅ **Delete Tasks**: Safe deletion with confirmation dialogs
- ✅ **Search Tasks**: Advanced filtering by title (substring), due date (exact), and status

**User Experience:**

- Split-view layout: Task table (left) + selected task details (right)
- Optimistic UI updates with server synchronization
- Comprehensive form validation (client-side + server error display)
- Loading states and user feedback messages
- Graceful error handling with fallback mechanisms

**Technical Implementation:**

- Reusable `TaskTable` component for consistent UI
- Server-backed search with automatic client-side fallback
- Complete test coverage with Vitest + Testing Library
- Type-safe API integration with axios


## High-Level Architecture (Current)

```
main.jsx (entry; mounts React app with routing)
pages/
  ├─ CreateTask.jsx    (task creation form)
  ├─ TaskDetails.jsx   (task detail view and editing)
  ├─ TaskListView.jsx  (main dashboard with task table)
  └─ SearchTasks.jsx   (advanced search and filtering)
components/
  ├─ Header.jsx        (navigation header)
  └─ Footer.jsx        (footer with links)
api/tasks.js         (axios client + CRUD/status/search helpers)
models/task.js       (status enum list, date helpers)
utils/taskUtils.js   (shared utility functions)
```

Clean routing structure with dedicated pages for each major function and shared utilities for consistent behavior.

---

## Data Flow & State

No Redux / context; each page owns only needed state:

- `Tasks.jsx` holds `tasks[]`, `selected`, `editing`, `showCreate`, transient flags (loading, creating, statusUpdating) and an `errors` object.
- `SearchTasks.jsx` maintains `filters`, `results[]`, `selected`, and search UX flags.
- `TaskListView.jsx` (legacy/simple) retains a sortable table variant.

Shared helpers in `models/task.js`:

- `STATUSES` – unified enum list (`NEW`, `PENDING`, `IN_PROGRESS`, `COMPLETED`, `APPROVED`, `CANCELLED`)
- `getDueDate`, `formatDisplayDate` – normalized date operations.

---

## CRUD Operations (UI → API Mapping)

| UI Action          | Component Origin                                                                       | API Call                                                     | Notes                                 |
| ------------------ | -------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------- |
| List tasks         | `Tasks`, `SearchTasks` (via `listTasks` inside `searchTasks` fallback), `TaskListView` | `GET /api/tasks`                                             | Loading states managed locally.       |
| View task detail   | `Tasks` (selection), `SearchTasks` (selection)                                         | (already in list payload) or `GET /api/tasks/{id}` if needed | Inline right-side detail panel.       |
| Create task        | `Tasks` -> `handleCreate`                                                              | `POST /api/tasks`                                            | Selects newly created row.            |
| Update task        | `Tasks` -> `handleEdit`                                                                | `PUT /api/tasks/{id}`                                        | Preserves selection.                  |
| Update status only | `Tasks` inline select                                                                  | `PUT /api/tasks/{id}/status?status=...`                      | Optimistic patch + refresh.           |
| Delete task        | `Tasks` -> `handleDelete`                                                              | `DELETE /api/tasks/{id}`                                     | Clears selection if deleted.          |
| Search tasks       | `SearchTasks` -> `searchTasks(filters)`                                                | `GET /api/tasks/search`                                      | Falls back to client filter on error. |

---

## Validation Strategy

Title required, due date must be future. Backend (Bean Validation) authoritative; 400 field map merged into local errors.

---

## TaskTable Component Overview

Props:

```
<TaskTable
  tasks={array}
  selectedId={id}
  onSelect={fn(task)}
  onEdit={fn(task)}
  onDelete={fn(task)}
  onStatusChange={fn(task, status)}
  statusChangingId={id}
  compact // optional
  readonly // hides actions & inline status select
/>
```

Accessibility:

- `aria-selected` on `<tr>` when selected
- Status select label pattern: "Change status for task <id>"
- Row click ignores clicks originating from buttons/selects to prevent accidental selection toggling.

---

## Search Helper (Server + Fallback)

`searchTasks({ title, dueDate, status })` issues `GET /api/tasks/search` with only non-empty filters. Backend semantics:

- Title: case-insensitive substring
- Status: exact enum match
- Due date: equality on date portion (YYYY-MM-DD)

If the request fails (network/server), a warning is logged and a legacy in-memory filter over `listTasks()` results is used so users still see filtered results.

---

## Testing (Key Files)

Comprehensive test coverage including component tests for CreateTask, TaskDetails, TaskListView, and SearchTasks, plus API integration tests.

Run tests:

```sh
cd kellyfrontendtask
npm install
npm test
```

## Extending Further

- Add pagination to `TaskTable` (slice + pager component).
- Column visibility toggles (pass list of columns to show).
- Bulk actions (maintain array of selected IDs with checkboxes).
- Debounced search in `SearchTasks` using `useEffect` rather than explicit submit.

---

## Troubleshooting

| Symptom                             | Hint                                                                              |
| ----------------------------------- | --------------------------------------------------------------------------------- |
| Status select disabled unexpectedly | `statusChangingId` matches row; verify network latency or errors in console.      |
| Search seems stale                  | Ensure filters changed before clicking Search (client-side doesn’t auto-refresh). |

