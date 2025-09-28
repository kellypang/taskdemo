package uk.gov.hmcts.reform.dev.exception;

/**
 * Signals a failure while persisting data to the underlying database.
 *
 * <p>Used to wrap {@link org.springframework.dao.DataAccessException} to decouple controller advice
 * from Spring Data specifics while still logging root cause.
 */
public class DatabaseWriteException extends RuntimeException {
  public DatabaseWriteException(String message) {
    super(message);
  }

  public DatabaseWriteException(String message, Throwable cause) {
    super(message, cause);
  }
}
