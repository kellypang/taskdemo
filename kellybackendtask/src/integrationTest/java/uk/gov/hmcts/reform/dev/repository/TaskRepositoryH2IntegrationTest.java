package uk.gov.hmcts.reform.dev.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import uk.gov.hmcts.reform.dev.entity.TaskEntity;
import uk.gov.hmcts.reform.dev.models.Status;

@DataJpaTest
@ActiveProfiles("test")
class TaskRepositoryH2IntegrationTest {

  @Autowired private TaskRepository taskRepository;

  @Test
  @DisplayName("Should persist and retrieve task by status")
  void persistAndRetrieveByStatus() {
    TaskEntity e1 =
        TaskEntity.builder()
            .title("Alpha")
            .description("First")
            .status(Status.PENDING)
            .dueDate(LocalDateTime.now().plusDays(1))
            .build();
    TaskEntity e2 =
        TaskEntity.builder()
            .title("Beta")
            .description("Second")
            .status(Status.IN_PROGRESS)
            .dueDate(LocalDateTime.now().plusDays(2))
            .build();
    taskRepository.saveAll(List.of(e1, e2));

    List<TaskEntity> pending = taskRepository.findByStatus(Status.PENDING);
    assertThat(pending).hasSize(1);
    assertThat(pending.getFirst().getTitle()).isEqualTo("Alpha");
  }

  @Test
  @DisplayName("Should find overdue tasks using dueDateBefore")
  void findOverdue() {
    LocalDateTime now = LocalDateTime.now();
    TaskEntity overdue =
        TaskEntity.builder()
            .title("Late")
            .status(Status.PENDING)
            .dueDate(now.minusHours(3))
            .build();
    TaskEntity future =
        TaskEntity.builder()
            .title("Future")
            .status(Status.PENDING)
            .dueDate(now.plusHours(5))
            .build();
    taskRepository.saveAll(List.of(overdue, future));

    List<TaskEntity> results = taskRepository.findByDueDateBefore(now);
    assertThat(results).extracting(TaskEntity::getTitle).containsExactly("Late");
  }
}
