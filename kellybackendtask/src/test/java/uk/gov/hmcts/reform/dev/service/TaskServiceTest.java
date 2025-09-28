package uk.gov.hmcts.reform.dev.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.dao.DataAccessException;
import uk.gov.hmcts.reform.dev.dto.request.TaskRequest;
import uk.gov.hmcts.reform.dev.dto.response.TaskResponse;
import uk.gov.hmcts.reform.dev.entity.TaskEntity;
import uk.gov.hmcts.reform.dev.exception.DatabaseWriteException;
import uk.gov.hmcts.reform.dev.exception.ResourceNotFoundException;
import uk.gov.hmcts.reform.dev.mapper.TaskMapper;
import uk.gov.hmcts.reform.dev.models.Status;
import uk.gov.hmcts.reform.dev.repository.TaskRepository;

class TaskServiceTest {

  @Mock TaskRepository taskRepository;
  @Mock TaskMapper mapper;
  @InjectMocks TaskService service;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
  }

  @Test
  void createTask_success() {
    TaskRequest req =
        TaskRequest.builder()
            .title("Title")
            .description("Desc")
            .status(Status.NEW)
            .dueDate(LocalDateTime.now().plusDays(1))
            .build();
    TaskEntity entity =
        TaskEntity.builder()
            .id(10L)
            .title("Title")
            .status(Status.NEW)
            .dueDate(req.getDueDate())
            .build();
    when(mapper.toEntity(req)).thenReturn(entity);
    when(taskRepository.save(entity)).thenReturn(entity);
    when(mapper.toResponse(entity))
        .thenReturn(new TaskResponse(10L, "Title", "Desc", Status.NEW, req.getDueDate(), null));

    TaskResponse resp = service.createTask(req);
    assertEquals(10L, resp.getId());
    verify(taskRepository).save(entity);
  }

  @Test
  void createTask_dataAccessThrowsWrapped() {
    TaskRequest req =
        TaskRequest.builder()
            .title("T")
            .status(Status.NEW)
            .dueDate(LocalDateTime.now().plusDays(1))
            .build();
    TaskEntity entity =
        TaskEntity.builder().title("T").status(Status.NEW).dueDate(req.getDueDate()).build();
    when(mapper.toEntity(req)).thenReturn(entity);
    when(taskRepository.save(entity)).thenThrow(new DataAccessException("db err") {});
    assertThrows(DatabaseWriteException.class, () -> service.createTask(req));
  }

  @Test
  void updateTaskStatus_updatesAndSaves() throws Exception {
    TaskEntity existing =
        TaskEntity.builder()
            .id(5L)
            .title("X")
            .status(Status.NEW)
            .dueDate(LocalDateTime.now().plusDays(1))
            .build();
    when(taskRepository.findById(5L)).thenReturn(Optional.of(existing));
    when(taskRepository.save(existing)).thenReturn(existing);
    when(mapper.toResponse(existing))
        .thenReturn(new TaskResponse(5L, "X", "Desc", Status.PENDING, existing.getDueDate(), null));
    TaskResponse resp = service.updateTaskStatus(5L, Status.PENDING);
    assertEquals(Status.PENDING, resp.getStatus());
    assertEquals(Status.PENDING, existing.getStatus());
    verify(taskRepository).save(existing);
  }

  @Test
  void updateTaskStatus_notFound() {
    when(taskRepository.findById(99L)).thenReturn(Optional.empty());
    assertThrows(ResourceNotFoundException.class, () -> service.updateTaskStatus(99L, Status.NEW));
  }

  @Test
  void getTaskById_notFound() {
    when(taskRepository.findById(77L)).thenReturn(Optional.empty());
    assertThrows(ResourceNotFoundException.class, () -> service.getTaskById(77L));
  }

  @Test
  void getTaskById_success() throws Exception {
    TaskEntity entity =
        TaskEntity.builder()
            .id(33L)
            .title("T")
            .status(Status.NEW)
            .dueDate(LocalDateTime.now().plusDays(1))
            .build();
    when(taskRepository.findById(33L)).thenReturn(Optional.of(entity));
    when(mapper.toResponse(entity))
        .thenReturn(new TaskResponse(33L, "T", null, Status.NEW, entity.getDueDate(), null));
    TaskResponse resp = service.getTaskById(33L);
    assertEquals(33L, resp.getId());
  }

  @Test
  void updateTask_success() throws Exception {
    TaskEntity existing =
        TaskEntity.builder()
            .id(44L)
            .title("Old")
            .description("OldD")
            .status(Status.NEW)
            .dueDate(LocalDateTime.now().plusDays(2))
            .build();
    when(taskRepository.findById(44L)).thenReturn(Optional.of(existing));
    when(taskRepository.save(existing)).thenReturn(existing);
    when(mapper.toResponse(existing))
        .thenReturn(
            new TaskResponse(44L, "New", "NewD", Status.PENDING, existing.getDueDate(), null));
    TaskRequest req =
        TaskRequest.builder()
            .title("New")
            .description("NewD")
            .status(Status.PENDING)
            .dueDate(existing.getDueDate())
            .build();
    TaskResponse resp = service.updateTask(44L, req);
    assertEquals("New", existing.getTitle());
    assertEquals(Status.PENDING, existing.getStatus());
    assertEquals(44L, resp.getId());
  }

  @Test
  void updateTask_notFound() {
    when(taskRepository.findById(555L)).thenReturn(Optional.empty());
    TaskRequest req =
        TaskRequest.builder()
            .title("T")
            .status(Status.NEW)
            .dueDate(LocalDateTime.now().plusDays(1))
            .build();
    assertThrows(ResourceNotFoundException.class, () -> service.updateTask(555L, req));
  }

  @Test
  void deleteTask_success() throws Exception {
    TaskEntity entity =
        TaskEntity.builder()
            .id(12L)
            .title("Del")
            .status(Status.NEW)
            .dueDate(LocalDateTime.now().plusDays(1))
            .build();
    when(taskRepository.findById(12L)).thenReturn(Optional.of(entity));
    service.deleteTask(12L);
    verify(taskRepository).delete(entity);
  }

  @Test
  void deleteTask_notFound() {
    when(taskRepository.findById(777L)).thenReturn(Optional.empty());
    assertThrows(ResourceNotFoundException.class, () -> service.deleteTask(777L));
  }

  @Test
  void getTasksByStatus_success() {
    TaskEntity e1 =
        TaskEntity.builder()
            .id(1L)
            .title("A")
            .status(Status.NEW)
            .dueDate(LocalDateTime.now().plusDays(1))
            .build();
    TaskEntity e2 =
        TaskEntity.builder()
            .id(2L)
            .title("B")
            .status(Status.NEW)
            .dueDate(LocalDateTime.now().plusDays(2))
            .build();
    when(taskRepository.findByStatus(Status.NEW)).thenReturn(List.of(e1, e2));
    when(mapper.toResponse(e1))
        .thenReturn(new TaskResponse(1L, "A", null, Status.NEW, e1.getDueDate(), null));
    when(mapper.toResponse(e2))
        .thenReturn(new TaskResponse(2L, "B", null, Status.NEW, e2.getDueDate(), null));
    var list = service.getTasksByStatus(Status.NEW);
    assertEquals(2, list.size());
  }

  @Test
  void getOverdueTasks_success() {
    TaskEntity e1 =
        TaskEntity.builder()
            .id(9L)
            .title("Old")
            .status(Status.NEW)
            .dueDate(LocalDateTime.now().minusDays(1))
            .build();
    when(taskRepository.findByDueDateBefore(any(LocalDateTime.class))).thenReturn(List.of(e1));
    when(mapper.toResponse(e1))
        .thenReturn(new TaskResponse(9L, "Old", null, Status.NEW, e1.getDueDate(), null));
    var list = service.getOverdueTasks(LocalDateTime.now());
    assertEquals(1, list.size());
    assertEquals(9L, list.get(0).getId());
  }
}
