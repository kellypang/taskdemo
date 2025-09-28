package uk.gov.hmcts.reform.dev.controllers;

import static org.mockito.ArgumentMatchers.any;
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
import org.junit.jupiter.api.BeforeEach;
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
class TaskControllerUnitTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private TaskService taskService;

  @Autowired private ObjectMapper objectMapper;

  private TaskRequest validRequest;

  @BeforeEach
  void setup() {
    validRequest =
        TaskRequest.builder()
            .title("A Title")
            .description("desc")
            .status(Status.PENDING)
            .dueDate(LocalDateTime.now().plusDays(1))
            .build();
  }

  @Test
  void createTask_returns201_whenValid() throws Exception {
    TaskResponse response =
        TaskResponse.builder()
            .id(1L)
            .title(validRequest.getTitle())
            .status(validRequest.getStatus())
            .dueDate(validRequest.getDueDate())
            .build();

    when(taskService.createTask(any(TaskRequest.class))).thenReturn(response);

    mockMvc
        .perform(
            post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value(1L))
        .andExpect(jsonPath("$.title").value("A Title"));
  }

  @Test
  void createTask_returns400_whenTitleMissing() throws Exception {
    TaskRequest request =
        TaskRequest.builder()
            .status(Status.PENDING)
            .dueDate(LocalDateTime.now().plusDays(1))
            .build();

    mockMvc
        .perform(
            post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.title").value("Title is required"));
  }

  @Test
  void getTask_returns404_whenMissing() throws Exception {
    when(taskService.getTaskById(42L))
        .thenThrow(new ResourceNotFoundException("Task not found with id 42"));

    mockMvc
        .perform(get("/api/tasks/{id}", 42L))
        .andExpect(status().isNotFound())
        .andExpect(content().string("Task not found with id 42"));
  }

  @Test
  void updateTask_validatesInput() throws Exception {
    TaskRequest bad =
        TaskRequest.builder()
            .title("") // NotBlank
            .status(Status.PENDING)
            .dueDate(LocalDateTime.now().plusDays(1))
            .build();

    mockMvc
        .perform(
            put("/api/tasks/{id}", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bad)))
        .andExpect(status().isBadRequest());
  }

  @Test
  void deleteTask_returns200_whenOk() throws Exception {
    mockMvc
        .perform(delete("/api/tasks/{id}", 1L))
        .andExpect(status().isOk())
        .andExpect(content().string("Task deleted successfully."));
  }
}
