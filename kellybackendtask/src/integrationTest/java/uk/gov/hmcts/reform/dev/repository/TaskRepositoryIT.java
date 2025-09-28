package uk.gov.hmcts.reform.dev.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import uk.gov.hmcts.reform.dev.entity.TaskEntity;
import uk.gov.hmcts.reform.dev.models.Status;
import uk.gov.hmcts.reform.dev.support.AbstractPostgresIntegrationTest;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class TaskRepositoryIT extends AbstractPostgresIntegrationTest {

  @Autowired TaskRepository repository;

  @BeforeEach
  void clean() {
    repository.deleteAll();
  }

  @Test
  void savesAndReadsEnumMapping() {
    TaskEntity e =
        TaskEntity.builder()
            .title("Enum Test")
            .status(Status.IN_PROGRESS)
            .dueDate(LocalDateTime.now().plusDays(1))
            .build();
    TaskEntity saved = repository.save(e);
    TaskEntity found = repository.findById(saved.getId()).orElseThrow();
    assertThat(found.getStatus()).isEqualTo(Status.IN_PROGRESS);
  }

  @Test
  void findsOverdueTasks() {
    TaskEntity overdue =
        TaskEntity.builder()
            .title("Overdue")
            .status(Status.NEW)
            .dueDate(LocalDateTime.now().minusHours(2))
            .build();
    TaskEntity future =
        TaskEntity.builder()
            .title("Future")
            .status(Status.NEW)
            .dueDate(LocalDateTime.now().plusHours(2))
            .build();
    repository.save(overdue);
    repository.save(future);
    List<TaskEntity> result = repository.findByDueDateBefore(LocalDateTime.now());
    assertThat(result)
        .extracting(TaskEntity::getTitle)
        .contains("Overdue")
        .doesNotContain("Future");
  }
}
