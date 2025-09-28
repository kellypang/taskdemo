package uk.gov.hmcts.reform.dev;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.shaded.org.awaitility.Awaitility;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("dev")
class SampleFunctionalTest {

  @LocalServerPort int port;
  @Autowired TestRestTemplate restTemplate;

  @Test
  @DisplayName("Functional: root welcome endpoint responds")
  void functionalTest() {
    Awaitility.await()
        .atMost(Duration.ofSeconds(20))
        .pollInterval(Duration.ofMillis(250))
        .ignoreExceptions()
        .untilAsserted(
            () -> {
              ResponseEntity<String> resp =
                  restTemplate.getForEntity("http://localhost:" + port + "/", String.class);
              assertThat(resp.getStatusCode().is2xxSuccessful()).isTrue();
              assertThat(resp.getBody()).startsWith("Welcome");
            });
  }
}
