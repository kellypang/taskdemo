package uk.gov.hmcts.reform.dev.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import uk.gov.hmcts.reform.dev.entity.TaskEntity;
import uk.gov.hmcts.reform.dev.models.Status;

@SpringBootTest
@ExtendWith(SpringExtension.class)
@Testcontainers
@ActiveProfiles("test")
class TaskRepositoryPostgresIT {

  // Reusable container for test lifecycle
  @Container
  static PostgreSQLContainer<?> postgres =
      new PostgreSQLContainer<>("postgres:16-alpine")
          .withDatabaseName("tasksdb")
          .withUsername("testuser")
          .withPassword("testpass");

  @DynamicPropertySource
  static void registerProps(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", postgres::getJdbcUrl);
    registry.add("spring.datasource.username", postgres::getUsername);
    registry.add("spring.datasource.password", postgres::getPassword);
    registry.add("spring.datasource.driverClassName", () -> "org.postgresql.Driver");
    registry.add("spring.jpa.hibernate.ddl-auto", () -> "update");
  }

  @Autowired private TaskRepository taskRepository;

  @Test
  @DisplayName("Postgres container: should persist and query tasks")
  void postgresCrudAndQueries() {
    TaskEntity soon =
        TaskEntity.builder()
            .title("Soon")
            .description("Future task")
            .status(Status.PENDING)
            .dueDate(LocalDateTime.now().plusHours(2))
            .build();
    TaskEntity late =
        TaskEntity.builder()
            .title("Late")
            .status(Status.IN_PROGRESS)
            .dueDate(LocalDateTime.now().minusHours(1))
            .build();
    taskRepository.saveAll(List.of(soon, late));

    List<TaskEntity> inProgress = taskRepository.findByStatus(Status.IN_PROGRESS);
    assertThat(inProgress).hasSize(1);
    assertThat(inProgress.getFirst().getTitle()).isEqualTo("Late");

    List<TaskEntity> overdue = taskRepository.findByDueDateBefore(LocalDateTime.now());
    assertThat(overdue).extracting(TaskEntity::getTitle).containsExactly("Late");
  }
}
