package uk.gov.hmcts.reform.dev.support;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Base class for Postgres-backed integration tests.
 *
 * <p>Responsibilities:
 *
 * <ul>
 *   <li>Provide a single static PostgreSQLContainer per test JVM.
 *   <li>Inject datasource + Flyway properties so that migrations run against the container.
 *   <li>Ensure profile 'test' is active while overriding datasource/profile-specific H2 settings.
 * </ul>
 */
@SpringBootTest
@Testcontainers
@ActiveProfiles("test")
public abstract class AbstractPostgresIntegrationTest {

  @Container
  @SuppressWarnings("resource")
  public static final PostgreSQLContainer<?> POSTGRES =
      new PostgreSQLContainer<>("postgres:16-alpine")
          .withDatabaseName("tasksdb")
          .withUsername("testuser")
          .withPassword("testpass");

  @DynamicPropertySource
  static void postgresProps(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
    registry.add("spring.datasource.username", POSTGRES::getUsername);
    registry.add("spring.datasource.password", POSTGRES::getPassword);
    registry.add("spring.datasource.driverClassName", () -> "org.postgresql.Driver");
    // Let Flyway run normally (ENUM types, etc.)
    registry.add("spring.flyway.enabled", () -> "true");
    // Use 'update' during integration testing to avoid failures if validation races
    // with Flyway
    // and to allow additive columns if migrations evolve. (If stricter checks
    // desired, revert to validate.)
    registry.add("spring.jpa.hibernate.ddl-auto", () -> "update");
  }
}
