package uk.gov.hmcts.reform.dev.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import uk.gov.hmcts.reform.dev.dto.request.TaskRequest;
import uk.gov.hmcts.reform.dev.dto.response.TaskResponse;
import uk.gov.hmcts.reform.dev.exception.ResourceNotFoundException;
import uk.gov.hmcts.reform.dev.models.Status;
import uk.gov.hmcts.reform.dev.service.TaskService;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@Tag(name = "Task Management", description = "Task Management API")
public class TaskController {
  private final TaskService taskService;

  public TaskController(TaskService taskService) {
    this.taskService = taskService;
  }

  // Endpoint to create a task
  @PostMapping
  @Operation(summary = "Create a new task")
  @ApiResponses({
    @ApiResponse(responseCode = "201", description = "Task created"),
    @ApiResponse(responseCode = "400", description = "Invalid input")
  })
  public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody TaskRequest taskRequest) {
    TaskResponse taskResponse = taskService.createTask(taskRequest); // Create task via service
    return new ResponseEntity<>(
        taskResponse, HttpStatus.CREATED); // Return 201 Created with task response
  }

  @GetMapping("/{id}")
  public ResponseEntity<TaskResponse> getTaskById(@PathVariable Long id)
      throws ResourceNotFoundException {
    TaskResponse task = taskService.getTaskById(id);
    return ResponseEntity.ok(task);
  }

  @PutMapping("/{id}")
  public ResponseEntity<TaskResponse> updateTask(
      @PathVariable Long id, @Valid @RequestBody TaskRequest taskRequest)
      throws ResourceNotFoundException {
    TaskResponse updatedTask = taskService.updateTask(id, taskRequest);
    return ResponseEntity.ok(updatedTask);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<String> deleteTask(@PathVariable Long id) throws ResourceNotFoundException {
    taskService.deleteTask(id);
    return ResponseEntity.ok("Task deleted successfully.");
  }

  @GetMapping
  @Operation(summary = "Get all tasks")
  public ResponseEntity<List<TaskResponse>> getAllTasks() {
    List<TaskResponse> tasks = taskService.getAllTasks();
    return ResponseEntity.ok(tasks);
  }

  @PutMapping("/{id}/status")
  @Operation(summary = "Update task status")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Task status updated"),
    @ApiResponse(responseCode = "404", description = "Task not found")
  })
  public ResponseEntity<TaskResponse> updateTaskStatus(
      @PathVariable Long id, @RequestParam Status status) throws ResourceNotFoundException {
    TaskResponse updated = taskService.updateTaskStatus(id, status);
    return ResponseEntity.ok(updated);
  }

  @GetMapping("/status/{status}")
  @Operation(summary = "Get tasks by status")
  public ResponseEntity<List<TaskResponse>> getTasksByStatus(@PathVariable Status status) {
    List<TaskResponse> tasks = taskService.getTasksByStatus(status);
    return ResponseEntity.ok(tasks);
  }

  @GetMapping("/overdue")
  @Operation(summary = "Get overdue tasks")
  public ResponseEntity<List<TaskResponse>> getOverdueTasks() {
    List<TaskResponse> tasks = taskService.getOverdueTasks(LocalDateTime.now());
    return ResponseEntity.ok(tasks);
  }

  @GetMapping("/statuses")
  @Operation(summary = "Get all possible task statuses")
  public ResponseEntity<List<Status>> getAllStatuses() {
    return ResponseEntity.ok(Arrays.asList(Status.values()));
  }

  @GetMapping("/search")
  @Operation(
      summary = "Search tasks by optional title substring, status, and/or dueDate (YYYY-MM-DD)")
  public ResponseEntity<List<TaskResponse>> searchTasks(
      @RequestParam(required = false) String title,
      @RequestParam(required = false) Status status,
      @RequestParam(required = false) String dueDate) {
    LocalDate parsedDate = null;
    if (dueDate != null && !dueDate.isBlank()) {
      try {
        parsedDate = LocalDate.parse(dueDate);
      } catch (Exception ignored) {
        /* invalid date -> treated as null */
      }
    }
    List<TaskResponse> results = taskService.searchTasks(title, status, parsedDate);
    return ResponseEntity.ok(results);
  }
}
