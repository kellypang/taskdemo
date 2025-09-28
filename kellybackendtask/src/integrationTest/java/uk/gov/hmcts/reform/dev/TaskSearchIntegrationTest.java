package uk.gov.hmcts.reform.dev;

import static org.hamcrest.Matchers.containsStringIgnoringCase;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(
    properties = {
      // Disable Flyway for this H2-backed web integration test. Flyway migrations
      // create PostgreSQL-specific ENUM types that are not compatible with H2.
      // Repository-level PostgreSQL container tests still run with Flyway enabled.
      "spring.flyway.enabled=false",
      // Force an in-memory H2 datasource to avoid external SPRING_DATASOURCE_URL
      // overrides that caused previous build failures when Postgres was absent.
      "spring.datasource.url=jdbc:h2:mem:searchtest;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
      "spring.datasource.username=sa",
      "spring.datasource.password=",
      // Explicit driver to override any external config.
      "spring.datasource.driverClassName=org.h2.Driver"
    })
@org.springframework.test.context.ActiveProfiles("test")
@AutoConfigureMockMvc
class TaskSearchIntegrationTest {

  @Autowired private MockMvc mockMvc;

  private String newTask(String title, String status, LocalDateTime due) {
    return String.format(
        "{\n  \"title\": \"%s\",\n  \"description\": \"Desc\",\n  \"status\": \"%s\",\n  \"dueDate\": \"%s\"\n}",
        title, status, due.toString());
  }

  private void create(String title, String status, int days) throws Exception {
    mockMvc
        .perform(
            post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(newTask(title, status, LocalDateTime.now().plusDays(days))))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id", notNullValue()));
  }

  @Test
  @DisplayName("Search by title substring, status, dueDate")
  void searchByVariousFilters() throws Exception {
    // Seed data
    create("Report Alpha", "NEW", 5);
    create("Report Beta", "PENDING", 7);
    create("Misc Task", "IN_PROGRESS", 3);

    // Title substring search
    mockMvc
        .perform(get("/api/tasks/search").param("title", "report"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))))
        .andExpect(jsonPath("$[*].title", everyItem(containsStringIgnoringCase("Report"))));

    // Combined title + status filter
    mockMvc
        .perform(get("/api/tasks/search").param("title", "report").param("status", "PENDING"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(1)))
        .andExpect(jsonPath("$[0].status", is("PENDING")));

    // Due date exact (capture one task's due date-only portion)
    String body = mockMvc.perform(get("/api/tasks")).andReturn().getResponse().getContentAsString();
    // naive parse first dueDate (find 'dueDate":"YYYY-MM-DD')
    String firstDate = body.replaceFirst(".*\\\"dueDate\\\":\\\"(\\d{4}-\\d{2}-\\d{2}).*", "$1");

    mockMvc
        .perform(get("/api/tasks/search").param("dueDate", firstDate))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", not(empty())));
  }
}
