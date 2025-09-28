-- Development seed data for task table
-- Safe to re-run: uses INSERT ... ON CONFLICT style via psql DO block (simpler: delete & insert here)

-- Optional cleanup (uncomment if you want a clean slate)
-- TRUNCATE TABLE public.task RESTART IDENTITY;

INSERT INTO public.task (title, description, status, duedate, tasknum)
VALUES
  ('Draft Spec', 'Initial specification draft', 'NEW', now() + interval '2 day', 1001),
  ('Data Import', 'Import legacy dataset', 'PENDING', now() + interval '5 day', 1002),
  ('Process Payments', 'Handle queued payment jobs', 'IN_PROGRESS', now() + interval '1 day', 1003),
  ('User Onboarding', 'Automate onboarding flow', 'COMPLETED', now() - interval '1 day', 1004),
  ('Security Review', 'Perform security assessment', 'APPROVED', now() + interval '7 day', 1005),
  ('Decommission Legacy', 'Remove old service', 'CANCELLED', now() - interval '5 day', 1006),
  ('Overdue Cleanup', 'Clear out old sessions', 'IN_PROGRESS', now() - interval '2 day', 1007),
  ('Near Deadline Report', 'Generate monthly report', 'PENDING', now() + interval '6 hour', 1008),
  ('Completed Hotfix', 'Apply hotfix patch', 'COMPLETED', now() - interval '3 hour', 1009),
  ('Approval Queue', 'Tasks awaiting approval', 'PENDING', now() + interval '3 day', 1010);

-- Extended sample set (additional coverage)
-- Includes: far future, far past, null due date, duplicate-ish titles with different statuses,
-- edge numeric tasknum values, clustering for pagination tests, and each enum again.

INSERT INTO public.task (title, description, status, duedate, tasknum)
VALUES
  ('Zero Day Migration', 'Execute immediate migration task', 'NEW', now() + interval '10 minute', 1011),
  ('Ref Data Sync', 'Synchronize reference data feed', 'PENDING', now() + interval '12 hour', 1012),
  ('Nightly Batch Cycle', 'Process nightly ETL', 'IN_PROGRESS', now() + interval '8 hour', 1013),
  ('Stale Session Purge', 'Cleanup task executed successfully', 'COMPLETED', now() - interval '10 day', 1014),
  ('Architecture Review', 'Awaiting architecture board approval', 'APPROVED', now() + interval '14 day', 1015),
  ('Rollback Deprecated API', 'Canceled due to new direction', 'CANCELLED', now() - interval '15 day', 1016),
  ('Null DueDate Example', 'Record without due date for null handling', 'NEW', NULL, 1017),
  ('Historical Audit', 'Very old archived style task', 'COMPLETED', now() - interval '120 day', 1018),
  ('Future Planning', 'Long range planning placeholder', 'PENDING', now() + interval '90 day', 1019),
  ('Edge Low TaskNum', 'Boundary test low number', 'IN_PROGRESS', now() + interval '30 minute', 1),
  ('Edge High TaskNum', 'Boundary test high-ish number', 'APPROVED', now() + interval '365 day', 99999),
  ('Duplicate Title Scenario', 'First variant pending', 'PENDING', now() + interval '4 day', 1020),
  ('Duplicate Title Scenario', 'Second variant in progress', 'IN_PROGRESS', now() + interval '5 day', 1021),
  ('Duplicate Title Scenario', 'Completed variant for history', 'COMPLETED', now() - interval '2 day', 1022),
  ('Pagination Cluster A', 'Clustered for pagination tests', 'NEW', now() + interval '1 day', 1101),
  ('Pagination Cluster B', 'Clustered for pagination tests', 'NEW', now() + interval '1 day', 1102),
  ('Pagination Cluster C', 'Clustered for pagination tests', 'NEW', now() + interval '1 day', 1103),
  ('Pagination Cluster D', 'Clustered for pagination tests', 'NEW', now() + interval '1 day', 1104),
  ('No Description Sample', NULL, 'PENDING', now() + interval '2 day', 1023),
  ('Immediate Execution', 'Due right now', 'IN_PROGRESS', now(), 1024),
  ('Overdue Critical', 'Should surface in overdue filter', 'PENDING', now() - interval '3 day', 1025),
  ('Recently Completed', 'Completed moments ago', 'COMPLETED', now() - interval '5 minute', 1026),
  ('Awaiting Sign-off', 'Approval pending on release', 'APPROVED', now() + interval '2 day', 1027),
  ('Cancelled Rollout', 'Change rollout aborted', 'CANCELLED', now() - interval '1 hour', 1028),
  ('Processing Queue', 'Currently processing items', 'IN_PROGRESS', now() - interval '30 minute', 1029),
  ('Mass Import', 'Large import job in backlog', 'PENDING', now() + interval '18 hour', 1030);
