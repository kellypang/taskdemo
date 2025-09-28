# Backend Service (Spring Boot Task API)

**✅ CRUD REST API** with comprehensive test coverage and validation.

## ✅ API Capabilities

**Core CRUD Operations:**

- ✅ **CREATE**: `POST /api/tasks` - Create new tasks with validation
- ✅ **READ**: `GET /api/tasks` - List all tasks, `GET /api/tasks/{id}` - Get specific task
- ✅ **UPDATE**: `PUT /api/tasks/{id}` - Full task updates, `PUT /api/tasks/{id}/status` - Status-only updates
- ✅ **DELETE**: `DELETE /api/tasks/{id}` - Safe task deletion
- ✅ **SEARCH**: `GET /api/tasks/search?title=&status=&dueDate=` - Multi-criteria search

**Extended Features:**

- Status filtering: `GET /api/tasks/status/{status}`
- Overdue tasks: `GET /api/tasks/overdue`
- Status enumeration: `GET /api/tasks/statuses`
- Data validation with Bean Validation (@Valid, @NotBlank, @Future)
- Comprehensive error handling (400/404 with proper messages)

**Data Model:**

- Task fields: `id`, `title`, `description`, `status`, `dueDate`, `tasknum`
- Status enum: `NEW`, `PENDING`, `IN_PROGRESS`, `COMPLETED`, `APPROVED`, `CANCELLED`

## Tech Stack

- **Java 21**, **Spring Boot 3.x**
- **Database**: PostgreSQL (production/integration), H2 (development)
- **Migrations**: Flyway (`V1__create_task_schema.sql`)
- **Testing**: JUnit 5, Mockito, RestAssured, Testcontainers
- **Build**: Gradle with custom source sets

## Profiles & Database Behavior

| `dev` | H2 in-memory (schema shim incl. enum) | Fast iteration, unit/functional defaults |
| `prod` | PostgreSQL (Flyway migrations) | Integration realism, local Postgres, deployed environments |

Specify via JVM property `-Dspring.profiles.active=dev|prod` or env var `SPRING_PROFILES_ACTIVE`.

Environment variables (when using Postgres):

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`

## Test Suite Overview

Four dedicated source sets under `src/`:

```
src/test/java            (Unit / lightweight)
src/integrationTest/java (Integration)
src/functionalTest/java  (Functional HTTP)
src/smokeTest/java       (Smoke)
```

| Suite                       | Purpose                                                                   | DB / Infra                              | Speed          | Typical Triggers                                  |
| --------------------------- | ------------------------------------------------------------------------- | --------------------------------------- | -------------- | ------------------------------------------------- |
| Unit / Lightweight (`test`) | Pure logic + Spring slice tests                                           | H2                                      | Fastest        | Entity/service changes, controller logic refactor |
| Integration (`integration`) | Flyway + PostgreSQL enum mapping, repository wiring                       | Testcontainers (Postgres)               | Medium         | Schema/enum/migration/persistence changes         |
| Functional (`functional`)   | Black-box API (HTTP) validation (status codes, JSON, validation messages) | H2 (default) or Postgres with profile   | Medium         | Contract/validation changes across endpoints      |
| Smoke (`smoke`)             | Minimal health + critical path create/list                                | External running target (no containers) | Fast (seconds) | Post-deploy / pipeline gating                     |

---

## Commands (Gradle Tasks)

From `kellybackendtask` directory (default dev profile uses H2, port 4000):

```sh
./gradlew test          # Unit / lightweight
./gradlew integration   # Integration (starts Postgres Testcontainer)
./gradlew functional    # Functional HTTP tests
./gradlew smoke         # Smoke tests (expects running service/db)
./gradlew check         # Lifecycle (includes integration via dependency)
./gradlew jacocoTestReport  # Aggregate coverage (unit + integration)
```

Coverage report: `build/reports/jacoco/test/html/index.html` (open in browser).

Common API endpoints (excerpt, full list in `../docs/api-endpoints.md`):

```
POST   /api/tasks                 # create
GET    /api/tasks                 # list
GET    /api/tasks/{id}            # detail
PUT    /api/tasks/{id}            # full update
PUT    /api/tasks/{id}/status     # status update (?status=VALUE)
DELETE /api/tasks/{id}            # delete
```

Run functional suite against Postgres (prod profile):

```sh
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/devdb
export SPRING_DATASOURCE_USERNAME=devuser
export SPRING_DATASOURCE_PASSWORD=devpass
./gradlew functional -Dspring.profiles.active=prod
./gradlew functional --args='--spring.profiles.active=devdb'
```

## Suite Details

### Unit / Lightweight

- Location: `src/test/java`
- Scope: Pure units (service logic), controller slices (using `@WebMvcTest`), validation binding tests.
- Should not depend on containerized infra.
- Use mocks for repositories; prefer constructor injection for testability.

### Integration

- Location: `src/integrationTest/java`
- Starts PostgreSQL via Testcontainers (real enum + dialect semantics).
- Validates: Flyway migrations, JPA mappings, repository queries, transaction boundaries.
- Fails fast on mapping mismatches (e.g. enum value absent in DB type).

### Functional

- Location: `src/functionalTest/java`
- Black-box HTTP: exercise REST endpoints using real controller, serialization, validation paths.
- Default DB = H2 unless you activate `prod` profile with datasource env vars.
- Focus: request/response contract, validation error shapes, status codes, basic end-to-end without DB-specific semantics.

### Smoke

- Location: `src/smokeTest/java`
- Assumes target service already running (no container start) — aims for <5s runtime.
- Tests: basic health/actuator endpoint, create + list minimal round trip.
- Intended for pipeline post-deploy step or manual environment sanity.


## Choosing Which Suite

| Change Type                                 | Recommended Suites                               |
| ------------------------------------------- | ------------------------------------------------ |
| Service method logic                        | Unit (+ Functional if affects response contract) |
| Controller request mapping / DTO validation | Unit (slice) + Functional                        |
| Entity field / migration / enum             | Integration (+ Unit if logic affected)           |
| Serialization format change                 | Functional                                       |
| Deployment verification                     | Smoke (optionally Node e2e script at root)       |


## Coverage Strategy

- `jacocoTestReport` merges execution data from `test` + `integration`.
- Functional and smoke are intentionally excluded from coverage to keep signal focused on logic & persistence layers.
- Consider adding coverage verification rules (minimum thresholds) in Gradle if quality gates needed.


## Validation & Error Handling Tests

Patterns:

- Controller validation: use `@WebMvcTest` with MockMvc expecting 400 + JSON field map.
- Integration: ensure persisted entity constraints align with DB (enum values, not-null fields).
- Functional: assert error payload structure stability (fields & messages) across endpoints.

Common error scenarios:
| Scenario | Expected Status | Notes |
|----------|-----------------|-------|
| Missing required field | 400 | Field present in JSON error map |
| Invalid enum | 400 | Message referencing enum name list |
| Resource not found | 404 | Consistent not-found message/key |
| Malformed JSON | 400 | Handled by global exception advice |

---

## Adding a New Test Suite (Pattern)

1. Define new source set in `build.gradle`.
2. Extend configurations from `testImplementation` / `runtimeOnly`.
3. Register a `Test` task pointing at new `testClassesDirs` + `classpath`.
4. Decide if wired into `check` or coverage aggregation.
5. (Optional) Add profile/env logic if special DB needed.

---

## Suggested CI Order (summarized)

1. `test` (fast fail)
2. `integration jacocoTestReport`
3. (Optional) `functional`
4. Build & deploy
5. `smoke` (against deployed env) + root Node CRUD script (optional)

---

## Troubleshooting

| Issue                                  | Hint                                                                             |
| -------------------------------------- | -------------------------------------------------------------------------------- |
| Testcontainers Postgres fails to start | Ensure Docker daemon running; check network/proxy limits.                        |
| Enum mismatch (integration)            | Verify Flyway applied; confirm `status_enum` created.                            |
| Functional tests using wrong DB        | Clear datasource env vars or explicitly set desired profile.                     |
| Smoke suite fails only in CI           | Confirm target base URL & credentials; ensure service started before test stage. |
| Coverage missing integration classes   | Run `integration` before `jacocoTestReport`.                                     |

