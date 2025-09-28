-- Flyway V1: initial task schema
-- Enum matches uk.gov.hmcts.reform.dev.models.Status values
CREATE TYPE public.status_enum AS ENUM ('NEW', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'APPROVED', 'CANCELLED');

CREATE TABLE public.task (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(100),
  description VARCHAR(200),
  status public.status_enum,
  duedate TIMESTAMP(6) WITHOUT TIME ZONE,
  tasknum INTEGER
);

-- Indexes (add more as needed later in new migrations)
CREATE INDEX idx_task_status ON public.task(status);
CREATE INDEX idx_task_due ON public.task(duedate);
