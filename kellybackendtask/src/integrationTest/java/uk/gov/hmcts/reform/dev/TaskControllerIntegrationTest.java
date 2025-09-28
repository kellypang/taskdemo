package uk.gov.hmcts.reform.dev;

import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import uk.gov.hmcts.reform.dev.support.AbstractPostgresIntegrationTest;

@AutoConfigureMockMvc
class TaskControllerIntegrationTest extends AbstractPostgresIntegrationTest {

  @Autowired private MockMvc mockMvc;

  private String jsonNewTask(String title, String status) {
    return String.format(
        "{\n  \"title\": \"%s\",\n  \"description\": \"Desc\",\n  \"status\": \"%s\",\n  \"dueDate\": \"%s\"\n}",
        title, status, LocalDateTime.now().plusDays(1).toString());
  }

  @Test
  @DisplayName("Create, fetch, list, update status")
  void endToEndBasicFlow() throws Exception {
    // Create
    String createBody = jsonNewTask("Int Test", "NEW");
    String location =
        mockMvc
            .perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON).content(createBody))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id", notNullValue()))
            .andExpect(jsonPath("$.title", is("Int Test")))
            .andReturn()
            .getResponse()
            .getContentAsString();

    String id = location.replaceAll(".*\"id\":(\\d+).*", "$1");

    mockMvc
        .perform(get("/api/tasks/" + id))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id", is(Integer.parseInt(id))));

    mockMvc
        .perform(get("/api/tasks"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", not(empty())));

    mockMvc
        .perform(put("/api/tasks/" + id + "/status?status=IN_PROGRESS"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status", is("IN_PROGRESS")));
  }
}
