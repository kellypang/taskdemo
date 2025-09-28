package uk.gov.hmcts.reform.dev.models;

/** Canonical lifecycle states for a task. Transitions are currently unconstrained. */
public enum Status {
  NEW,
  PENDING,
  IN_PROGRESS,
  COMPLETED,
  APPROVED,
  CANCELLED
}
