package uk.gov.hmcts.reform.dev.api;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import uk.gov.hmcts.reform.dev.dto.request.TaskRequest;
import uk.gov.hmcts.reform.dev.models.Status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("dev")
class TaskApiFunctionalTest {

  @LocalServerPort int port;
  @Autowired TestRestTemplate rest;

  private String base() {
    return "http://localhost:" + port + "/api/tasks";
  }

  @Test
  void createListAndDeleteTask() {
    TaskRequest req =
        TaskRequest.builder()
            .title("Functional")
            .description("Desc")
            .status(Status.NEW)
            .dueDate(LocalDateTime.now().plusDays(1))
            .build();

    ResponseEntity<String> createResp = rest.postForEntity(base(), req, String.class);
    assertThat(createResp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
    String body = createResp.getBody();

    ResponseEntity<String> list = rest.getForEntity(base(), String.class);
    assertThat(list.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(list.getBody()).contains("Functional");

    if (body != null && body.contains("\"id\"")) {
      Optional<Integer> idOpt =
          body.lines()
              .filter(l -> l.contains("\"id\""))
              .findFirst()
              .map(l -> l.replaceAll(".*\"id\":(\\d+).*", "$1"))
              .flatMap(
                  s -> {
                    try {
                      return Optional.of(Integer.parseInt(s));
                    } catch (NumberFormatException e) {
                      return Optional.empty();
                    }
                  });
      idOpt.ifPresent(id -> rest.delete(base() + "/" + id));
    }
  }
}
