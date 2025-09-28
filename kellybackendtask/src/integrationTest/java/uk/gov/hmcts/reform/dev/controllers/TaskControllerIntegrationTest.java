package uk.gov.hmcts.reform.dev.controllers;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import uk.gov.hmcts.reform.dev.dto.request.TaskRequest;
import uk.gov.hmcts.reform.dev.dto.response.TaskResponse;
import uk.gov.hmcts.reform.dev.exception.ResourceNotFoundException;
import uk.gov.hmcts.reform.dev.models.Status;
import uk.gov.hmcts.reform.dev.service.TaskService;

@WebMvcTest(TaskController.class)
public class TaskControllerIntegrationTest {

  @Autowired private MockMvc mockMvc;
  @MockitoBean private TaskService taskService;

  @Autowired private ObjectMapper objectMapper;

  @Test()
  void shouldCreateTaskSuccessfully() throws Exception {
    // Arrange
    TaskRequest request = new TaskRequest();
    request.setTitle("Test Task");
    request.setDescription("Optional description");
    request.setStatus(Status.PENDING);
    request.setDueDate(LocalDateTime.now().plusDays(1));

    TaskResponse response =
        new TaskResponse(
            1L, "Test Task", "Optional description", Status.PENDING, request.getDueDate());

    when(taskService.createTask(request)).thenReturn(response);

    // Act & Assert
    mockMvc
        .perform(
            post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value(1L))
        .andExpect(jsonPath("$.title").value("Test Task"))
        .andExpect(jsonPath("$.description").value("Optional description"))
        .andExpect(jsonPath("$.status").value("PENDING"));
  }

  @Test
  void shouldReturnBadRequest_whenTitleIsMissing() throws Exception {
    TaskRequest request =
        TaskRequest.builder()
            .description("Some description")
            .status(Status.PENDING)
            .dueDate(LocalDateTime.now().plusDays(1))
            .build(); // Title is missing

    mockMvc
        .perform(
            post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.title").value("Title is required"));
  }

  @Test
  void shouldReturnTaskSuccessfully_whenTaskExists() throws Exception {
    // Given
    Long taskId = 1L;
    TaskResponse response =
        new TaskResponse(
            taskId,
            "Test Task",
            "Some Description",
            Status.PENDING,
            LocalDateTime.now().plusDays(2));

    when(taskService.getTaskById(taskId)).thenReturn(response);

    // When + Then
    mockMvc
        .perform(get("/api/tasks/{id}", taskId).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(taskId))
        .andExpect(jsonPath("$.title").value("Test Task"))
        .andExpect(jsonPath("$.status").value("PENDING"));
  }

  @Test
  void shouldReturnNotFound_whenTaskDoesNotExist() throws Exception {
    // Given
    Long taskId = 99L;
    when(taskService.getTaskById(taskId))
        .thenThrow(new ResourceNotFoundException("Task not found with id " + taskId));

    // When + Then
    mockMvc
        .perform(get("/api/tasks/{id}", taskId).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andExpect(content().string("Task not found with id 99"));
  }

  @Test
  void shouldUpdateTaskSuccessfully_viaApi() throws Exception {
    Long taskId = 1L;

    TaskRequest updatedRequest =
        TaskRequest.builder()
            .title("New Title")
            .description("Updated Desc")
            .status(Status.IN_PROGRESS)
            .dueDate(LocalDateTime.now().plusDays(5))
            .build();

    TaskResponse response =
        TaskResponse.builder()
            .id(taskId)
            .title(updatedRequest.getTitle())
            .description(updatedRequest.getDescription())
            .status(updatedRequest.getStatus())
            .dueDate(updatedRequest.getDueDate())
            .build();

    // Mock service response
    when(taskService.updateTask(eq(taskId), any(TaskRequest.class))).thenReturn(response);

    // Perform the PUT request
    mockMvc
        .perform(
            put("/api/tasks/{id}", taskId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedRequest)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.title").value("New Title"))
        .andExpect(jsonPath("$.status").value("IN_PROGRESS"))
        .andExpect(jsonPath("$.description").value("Updated Desc"));
  }

  @Test
  void shouldReturn404_whenUpdatingNonExistingTask() throws Exception {
    Long id = 1234L;

    TaskRequest updatedRequest =
        TaskRequest.builder()
            .title("New Title")
            .status(Status.IN_PROGRESS)
            .dueDate(LocalDateTime.now().plusDays(3))
            .build();

    when(taskService.updateTask(eq(id), any(TaskRequest.class)))
        .thenThrow(new ResourceNotFoundException("Task not found with id " + id));

    mockMvc
        .perform(
            put("/api/tasks/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedRequest)))
        .andExpect(status().isNotFound())
        .andExpect(content().string("Task not found with id " + id));
  }

  @Test
  void shouldDeleteTaskSuccessfully_viaApi() throws Exception {
    Long id = 1L;

    // Act & Assert
    mockMvc
        .perform(delete("/api/tasks/{id}", id))
        .andExpect(status().isOk())
        .andExpect(content().string("Task deleted successfully."));

    // Verify service call
    verify(taskService, times(1)).deleteTask(id);
  }

  @Test
  void shouldReturn404_whenDeletingNonExistentTask() throws Exception {
    Long taskId = 99L;

    doThrow(new ResourceNotFoundException("Task not found with id " + taskId))
        .when(taskService)
        .deleteTask(taskId);

    mockMvc
        .perform(delete("/api/tasks/{id}", taskId))
        .andExpect(status().isNotFound())
        .andExpect(content().string("Task not found with id " + taskId));
  }

  @Test
  void shouldReturnListOfTasks_viaApi() throws Exception {
    TaskResponse task1 =
        TaskResponse.builder().id(1L).title("Task 1").status(Status.PENDING).build();
    TaskResponse task2 =
        TaskResponse.builder().id(2L).title("Task 2").status(Status.IN_PROGRESS).build();

    when(taskService.getAllTasks()).thenReturn(List.of(task1, task2));

    mockMvc
        .perform(get("/api/tasks").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.size()").value(2))
        .andExpect(jsonPath("$[0].title").value("Task 1"))
        .andExpect(jsonPath("$[1].status").value("IN_PROGRESS"));
  }

  @Test
  void shouldReturnEmptyList_whenNoTasksExist_viaApi() throws Exception {
    when(taskService.getAllTasks()).thenReturn(Collections.emptyList());

    mockMvc
        .perform(get("/api/tasks").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(0));

    verify(taskService, times(1)).getAllTasks();
  }
}
