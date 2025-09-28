package uk.gov.hmcts.reform.dev.service;

import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import uk.gov.hmcts.reform.dev.dto.request.TaskRequest;
import uk.gov.hmcts.reform.dev.dto.response.TaskResponse;
import uk.gov.hmcts.reform.dev.entity.TaskEntity;
import uk.gov.hmcts.reform.dev.exception.DatabaseWriteException;
import uk.gov.hmcts.reform.dev.exception.ResourceNotFoundException;
import uk.gov.hmcts.reform.dev.mapper.TaskMapper;
import uk.gov.hmcts.reform.dev.repository.TaskRepository;

/**
 * Core business service orchestrating task persistence and transformations.
 *
 * <p>Acts as a boundary isolating controllers from repository & mapping concerns. Also the proper
 * home for future cross-cutting rules such as status transition validation.
 */
@Service
public class TaskService {
  private final TaskRepository taskRepository;
  private final TaskMapper taskMapper;
  private static final Logger log = LoggerFactory.getLogger(TaskService.class);

  public TaskService(TaskRepository taskRepository, TaskMapper taskMapper) {
    this.taskRepository = taskRepository;
    this.taskMapper = taskMapper;
  }

  // Create Task
  public TaskResponse createTask(TaskRequest taskRequest) {
    try {
      TaskEntity taskEntity = taskMapper.toEntity(taskRequest);
      TaskEntity savedTask = taskRepository.save(taskEntity);
      return taskMapper.toResponse(savedTask);
    } catch (DataAccessException exception) {
      // Provide underlying cause details in logs for diagnostics while keeping client
      // message stable
      log.error(
          "Database write failure while creating task: {}", exception.getMessage(), exception);
      throw new DatabaseWriteException("Failed to save task to the database.", exception);
    }
  }

  // Get Task by Id
  public TaskResponse getTaskById(Long id) throws ResourceNotFoundException {
    TaskEntity entity =
        taskRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found with id " + id));
    return taskMapper.toResponse(entity);
  }

  public TaskResponse updateTask(Long id, TaskRequest taskRequest)
      throws ResourceNotFoundException {
    TaskEntity existing =
        taskRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found with id " + id));

    // Map updates from request to the entity
    existing.setTitle(taskRequest.getTitle());
    existing.setDescription(taskRequest.getDescription());
    existing.setStatus(taskRequest.getStatus());
    existing.setDueDate(taskRequest.getDueDate());

    TaskEntity saved = taskRepository.save(existing);
    return taskMapper.toResponse(saved);
  }

  public void deleteTask(Long id) throws ResourceNotFoundException {
    TaskEntity task =
        taskRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found with id " + id));
    taskRepository.delete(task);
  }

  public List<TaskResponse> getAllTasks() {
    List<TaskEntity> tasks = taskRepository.findAll();
    return tasks.stream().map(taskMapper::toResponse).collect(Collectors.toList());
  }

  // Update only the status
  public TaskResponse updateTaskStatus(Long id, uk.gov.hmcts.reform.dev.models.Status status)
      throws ResourceNotFoundException {
    TaskEntity entity =
        taskRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found with id " + id));
    entity.setStatus(status);
    TaskEntity saved = taskRepository.save(entity);
    return taskMapper.toResponse(saved);
  }

  // Filter by status
  public List<TaskResponse> getTasksByStatus(uk.gov.hmcts.reform.dev.models.Status status) {
    return taskRepository.findByStatus(status).stream()
        .map(taskMapper::toResponse)
        .collect(Collectors.toList());
  }

  // Overdue tasks
  public List<TaskResponse> getOverdueTasks(java.time.LocalDateTime now) {
    return taskRepository.findByDueDateBefore(now).stream()
        .map(taskMapper::toResponse)
        .collect(Collectors.toList());
  }

  // Search (simple in-memory filter). For larger datasets, implement
  // specification / query method.
  public List<TaskResponse> searchTasks(
      String title, uk.gov.hmcts.reform.dev.models.Status status, java.time.LocalDate dueDate) {
    List<TaskEntity> all = taskRepository.findAll();
    return all.stream()
        .filter(
            e ->
                title == null
                    || title.isBlank()
                    || (e.getTitle() != null
                        && e.getTitle().toLowerCase().contains(title.toLowerCase())))
        .filter(e -> status == null || e.getStatus() == status)
        .filter(
            e ->
                dueDate == null
                    || (e.getDueDate() != null && e.getDueDate().toLocalDate().isEqual(dueDate)))
        .map(taskMapper::toResponse)
        .collect(Collectors.toList());
  }
}
