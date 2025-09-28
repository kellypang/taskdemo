package uk.gov.hmcts.reform.dev;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Spring Boot application entry point.
 *
 * <p>Responsibilities:
 *
 * <ul>
 *   <li>Bootstraps Spring context and auto-configuration.
 *   <li>Triggers component scanning for the {@code uk.gov.hmcts.reform.dev} package.
 * </ul>
 *
 * There is intentionally no additional startup logic here to keep the main method lightweight and
 * test-friendly.
 */
@SpringBootApplication
@SuppressWarnings(
    "HideUtilityClassConstructor") // Spring needs a constructor, its not a utility class
public class Application {

  public static void main(final String[] args) {
    SpringApplication.run(Application.class, args);
  }
}
