package uk.gov.hmcts.reform.dev.dto.response;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import uk.gov.hmcts.reform.dev.models.Status;

/**
 * DTO representing task data returned to API consumers. Designed to decouple persistence model from
 * external contract.
 */
@Data
@AllArgsConstructor
@Builder
public class TaskResponse {
  private Long id;
  private String title;
  private String description;
  private Status status;
  private LocalDateTime dueDate;
  private Integer tasknum;

  // Convenience constructor for tests/usages that don't provide tasknum
  public TaskResponse(
      Long id, String title, String description, Status status, LocalDateTime dueDate) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.status = status;
    this.dueDate = dueDate;
    this.tasknum = null;
  }
}
