package uk.gov.hmcts.reform.dev.exception;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import java.util.Collections;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;

class GlobalExceptionHandlerTest {

  @Test
  void handlesResourceNotFound() {
    GlobalExceptionHandler h = new GlobalExceptionHandler();
    ResponseEntity<String> resp =
        h.handleResourceNotFoundException(new ResourceNotFoundException("not found"));
    assertEquals(HttpStatus.NOT_FOUND, resp.getStatusCode());
    assertEquals("not found", resp.getBody());
  }

  @Test
  void handlesBadJson() {
    GlobalExceptionHandler h = new GlobalExceptionHandler();
    ResponseEntity<String> resp =
        h.handleInvalidJson(
            new HttpMessageNotReadableException("bad", new java.io.IOException("bad"), null));
    assertEquals(HttpStatus.BAD_REQUEST, resp.getStatusCode());
    assertEquals("Malformed JSON request", resp.getBody());
  }

  @Test
  void handlesConstraintViolation() {
    GlobalExceptionHandler h = new GlobalExceptionHandler();
    ConstraintViolationException ex =
        new ConstraintViolationException(Collections.<ConstraintViolation<?>>emptySet());
    ResponseEntity<Map<String, String>> resp = h.handleConstraintViolation(ex);
    assertEquals(HttpStatus.BAD_REQUEST, resp.getStatusCode());
    assertTrue(resp.getBody().isEmpty());
  }

}
