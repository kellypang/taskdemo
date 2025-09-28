package uk.gov.hmcts.reform.dev.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uk.gov.hmcts.reform.dev.models.Status;

@Data
/**
 * DTO representing the client-supplied data to create or update a task.
 *
 * <p>Bean Validation annotations enforce required business constraints before reaching the service
 * layer.
 */
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class TaskRequest {
  @NotBlank(message = "Title is required")
  private String title;

  private String description;

  @NotNull(message = "Status is required")
  private Status status;

  @NotNull(message = "Due date is required")
  @Future(message = "Due date must be in the future")
  private LocalDateTime dueDate;

  private Integer tasknum;
}
