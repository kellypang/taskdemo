package uk.gov.hmcts.reform.dev.api;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SmokeTest {

  @LocalServerPort int port;

  @Autowired TestRestTemplate restTemplate;

  @Test
  void listEndpointUp() {
    ResponseEntity<String> resp =
        restTemplate.getForEntity("http://localhost:" + port + "/api/tasks", String.class);
    assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
  }
}
