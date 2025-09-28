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
import org.testcontainers.shaded.org.awaitility.Awaitility;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SampleSmokeTest {

  @LocalServerPort int port;

  @Autowired TestRestTemplate restTemplate;

  @Test
  @DisplayName("Smoke: root welcome endpoint responds")
  void smokeTest() {
    // Await the embedded server becoming responsive instead of ad-hoc loop.
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
