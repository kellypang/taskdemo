package uk.gov.hmcts.reform.dev.controllers;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Stream;
import javax.sql.DataSource;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api/info", produces = MediaType.APPLICATION_JSON_VALUE)
/**
 * Operational information endpoint.
 *
 * <p>Provides lightweight runtime diagnostics including:
 *
 * <ul>
 *   <li>Application name
 *   <li>Active and default Spring profiles
 *   <li>Database product and sanitized JDBC URL (credentials stripped)
 * </ul>
 *
 * Intended for manual inspection and basic health insight during development; not a replacement for
 * full Actuator endpoints.
 */
public class InfoController {

  private final Environment environment;
  private final ObjectProvider<DataSource> dataSourceProvider;

  @Value("${spring.application.name:application}")
  private String appName;

  public InfoController(Environment environment, ObjectProvider<DataSource> dataSourceProvider) {
    this.environment = environment;
    this.dataSourceProvider = dataSourceProvider;
  }

  @GetMapping
  public Map<String, Object> info() {
    Map<String, Object> out = new HashMap<>();
    out.put("application", appName);
    out.put("activeProfiles", environment.getActiveProfiles());
    out.put("defaultProfiles", environment.getDefaultProfiles());
    out.put("database", dbDetails());
    return out;
  }

  private Map<String, Object> dbDetails() {
    Map<String, Object> db = new HashMap<>();
    DataSource ds = dataSourceProvider.getIfAvailable();
    if (ds == null) {
      db.put("status", "not-configured");
      return db;
    }
    try (Connection c = ds.getConnection()) {
      DatabaseMetaData meta = c.getMetaData();
      db.put("product", meta.getDatabaseProductName());
      db.put("version", meta.getDatabaseProductVersion());
      String url = meta.getURL();
      db.put("url", sanitize(url));
    } catch (Exception e) {
      db.put("error", e.getClass().getSimpleName() + ":" + e.getMessage());
    }
    return db;
  }

  private String sanitize(String url) {
    if (url == null) {
      return null;
    }
    int idx = url.indexOf("?");
    if (idx > -1) {
      url = url.substring(0, idx);
    }
    // Remove credentials in form jdbc:postgresql://user:pass@host:port/db
    if (url.startsWith("jdbc:postgresql://")) {
      String rest = url.substring("jdbc:postgresql://".length());
      // keep part after @ if present
      String sanitized = Stream.of(rest.split("@", 2)).reduce((a, b) -> b).orElse(rest);
      return "jdbc:postgresql://" + sanitized;
    }
    return url;
  }
}
