package uk.gov.hmcts.reform.dev.mapper;

import org.springframework.stereotype.Component;
import uk.gov.hmcts.reform.dev.dto.request.TaskRequest;
import uk.gov.hmcts.reform.dev.dto.response.TaskResponse;
import uk.gov.hmcts.reform.dev.entity.TaskEntity;

@Component
/**
 * Maps between API DTOs (TaskRequest/TaskResponse) and the JPA {@link TaskEntity}. Explicit mapping
 * keeps intent clear for this small model.
 */
public class TaskMapper {
  // Convert TaskRequest (DTO) to TaskEntity (JPA Entity)
  public TaskEntity toEntity(TaskRequest taskRequest) {
    return TaskEntity.builder()
        .title(taskRequest.getTitle())
        .description(taskRequest.getDescription())
        .status(taskRequest.getStatus())
        .dueDate(taskRequest.getDueDate())
        .tasknum(taskRequest.getTasknum())
        .build();
  }

  // Convert TaskEntity (JPA Entity) to TaskResponse (DTO)
  public TaskResponse toResponse(TaskEntity taskEntity) {
    return new TaskResponse(
        taskEntity.getId(),
        taskEntity.getTitle(),
        taskEntity.getDescription(),
        taskEntity.getStatus(),
        taskEntity.getDueDate(),
        taskEntity.getTasknum());
  }
}
