package uk.gov.hmcts.reform.dev.repository;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uk.gov.hmcts.reform.dev.entity.TaskEntity;
import uk.gov.hmcts.reform.dev.models.Status;

/** Spring Data repository abstraction for tasks with convenience finders. */
@Repository
public interface TaskRepository extends JpaRepository<TaskEntity, Long> {

  List<TaskEntity> findByStatus(Status status);

  List<TaskEntity> findByDueDateBefore(LocalDateTime cutOff);
}
