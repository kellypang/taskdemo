package uk.gov.hmcts.reform.dev;

import static org.assertj.core.api.Assertions.assertThat;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.testcontainers.shaded.org.awaitility.Awaitility;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class TaskApiFunctionalTest {

  @LocalServerPort int port;

  @BeforeAll
  static void setupRestAssured() {
    RestAssured.enableLoggingOfRequestAndResponseIfValidationFails();
  }

  private String futureDate() {
    return LocalDateTime.now().plusDays(1).toString();
  }

  @Test
  @DisplayName("Functional: create -> list -> delete")
  void createListDeleteFlow() {
    // Wait until the tasks endpoint returns either 200 (empty list) or 4xx (still
    // starting) then 200
    Awaitility.await()
        .atMost(Duration.ofSeconds(20))
        .pollInterval(Duration.ofMillis(300))
        .ignoreExceptions()
        .untilAsserted(
            () -> RestAssured.given().port(port).when().get("/api/tasks").then().statusCode(200));
    // Create
    var createResp =
        RestAssured.given()
            .port(port)
            .contentType(ContentType.JSON)
            .body(
                Map.of(
                    "title", "Func Task",
                    "description", "Desc",
                    "status", "NEW",
                    "dueDate", futureDate()))
            .when()
            .post("/api/tasks")
            .then()
            .statusCode(201)
            .extract();

    Integer id = createResp.path("id");
    assertThat(id).isNotNull();

    // List
    RestAssured.given().port(port).when().get("/api/tasks").then().statusCode(200);

    // Delete
    RestAssured.given().port(port).when().delete("/api/tasks/" + id).then().statusCode(200);
  }
}
