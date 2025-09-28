package uk.gov.hmcts.reform.dev.task;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.time.LocalDateTime;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import uk.gov.hmcts.reform.dev.dto.request.TaskRequest;
import uk.gov.hmcts.reform.dev.models.Status;

public class TaskRequestValidationTest {
  private Validator validator;

  @BeforeEach
  void setUp() {
    ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
    validator = factory.getValidator();
  }

  @Test
  void shouldFailWhenTitleIsMissing() {
    TaskRequest request = new TaskRequest();
    request.setStatus(Status.IN_PROGRESS);
    request.setDueDate(LocalDateTime.now().plusDays(1));

    Set<ConstraintViolation<TaskRequest>> violations = validator.validate(request);

    assertEquals(1, violations.size());
    assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("title")));
  }

  @Test
  void shouldFailWhenStatusIsBlank() {
    TaskRequest request = new TaskRequest();
    request.setTitle("Test Title");
    request.setStatus(null);
    request.setDueDate(LocalDateTime.now().plusDays(1));

    Set<ConstraintViolation<TaskRequest>> violations = validator.validate(request);

    assertEquals(1, violations.size());
    assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("status")));
  }

  @Test
  void shouldFailWhenDueDateIsInPast() {
    TaskRequest request = new TaskRequest();
    request.setTitle("Test Title");
    request.setStatus(Status.IN_PROGRESS);
    request.setDueDate(LocalDateTime.now().minusDays(1));

    Set<ConstraintViolation<TaskRequest>> violations = validator.validate(request);

    assertEquals(1, violations.size());
    assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("dueDate")));
  }

  @Test
  void shouldPassWhenAllFieldsValid() {
    TaskRequest request = new TaskRequest();
    request.setTitle("Valid Task");
    request.setStatus(Status.IN_PROGRESS);
    request.setDueDate(LocalDateTime.now().plusDays(1));
    request.setDescription("Optional description");

    Set<ConstraintViolation<TaskRequest>> violations = validator.validate(request);

    assertTrue(violations.isEmpty());
  }
}
