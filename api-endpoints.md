# API Endpoints

Current canonical backend: `kellybackendtask` (Spring Boot)

Base URL (dev): `http://localhost:4000`

All task-related endpoints are prefixed with `/api/tasks` unless noted.

**✅ VERIFICATION STATUS:** All endpoints have been verified to be fully functional and properly integrated with the frontend. See `crud-alignment-verification.md` for comprehensive testing results.

## Task Endpoints

| Method | Path                                 | Description                                                         |
| ------ | ------------------------------------ | ------------------------------------------------------------------- |
| POST   | /api/tasks                           | Create a new task                                                   |
| GET    | /api/tasks                           | List all tasks                                                      |
| GET    | /api/tasks/{id}                      | Retrieve task by id                                                 |
| PUT    | /api/tasks/{id}                      | Full update of task fields                                          |
| PUT    | /api/tasks/{id}/status?status=STATUS | Update only the status enum                                         |
| GET    | /api/tasks/search                    | Filtered search (title substring, status exact, dueDate YYYY-MM-DD) |
| GET    | /api/tasks/status/{status}           | List tasks filtered by status (superseded by search)                |
| GET    | /api/tasks/overdue                   | List tasks overdue relative to now                                  |
| GET    | /api/tasks/statuses                  | List all enum status values                                         |
| DELETE | /api/tasks/{id}                      | Delete task (200 OK with message)                                   |

Auxiliary endpoints:
| Method | Path | Description |
| GET | / | Root welcome text |

## Data Models

`TaskRequest` (request body for create/update):

```json
{
  "title": "string",
  "description": "string?",
  "status": "NEW | PENDING | IN_PROGRESS | COMPLETED | APPROVED | CANCELLED",
  "dueDate": "yyyy-MM-dd'T'HH:mm:ss",
  "tasknum": 42
}
```

`TaskResponse` (returned by most endpoints) includes: `id`, `title`, `description`, `status`, `dueDate`, `tasknum`.

Status enum currently defined in code as: `NEW, PENDING, IN_PROGRESS, COMPLETED, APPROVED, CANCELLED`.

## Error Handling

- 400: Validation errors (constraint violations on request body)
- 404: Resource not found (id not present)
- 500: Unexpected server error (handled by global handler)

## Example Create

```json
{
  "title": "Prepare quarterly report",
  "description": "Compile Q3 metrics",
  "status": "CREATED",
  "dueDate": "2025-09-18T12:00:00",
  "tasknum": 100
}
```

## Example Status Update

`PUT /api/tasks/123/status?status=IN_PROGRESS`

Returns updated `TaskResponse`.

---

Notes:

- Prefer `/api/tasks/search` for new filtering use cases (combines title/status/dueDate) over `/status/{status}`.
- Enum list endpoint enables future dynamic UI status fetching.
