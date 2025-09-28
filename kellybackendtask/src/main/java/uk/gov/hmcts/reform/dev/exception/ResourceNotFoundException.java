package uk.gov.hmcts.reform.dev.exception;

/**
 * Thrown when a requested entity (e.g. Task) cannot be located.
 *
 * <p>Mapped to HTTP 404 by {@link GlobalExceptionHandler}.
 */
public class ResourceNotFoundException extends Exception {
  public ResourceNotFoundException(String message) {
    super(message);
  }
}
