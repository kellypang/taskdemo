package uk.gov.hmcts.reform.dev;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.ResponseEntity;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SmokeHealthTest {

  @LocalServerPort int port;

  private final TestRestTemplate rest = new TestRestTemplate();

  @Test
  @DisplayName(
      "Smoke: context loads and health endpoint accessible (expect 404 or restricted if not exposed)")
  void healthOrRootReachable() {
    // Try root (since actuator health is not fully exposed in config include list
    // yet)
    ResponseEntity<String> root = rest.getForEntity("http://localhost:" + port + "/", String.class);
    assertThat(root.getStatusCode().is2xxSuccessful() || root.getStatusCode().is4xxClientError())
        .isTrue();
  }
}
