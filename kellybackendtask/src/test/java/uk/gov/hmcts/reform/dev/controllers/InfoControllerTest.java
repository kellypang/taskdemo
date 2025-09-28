package uk.gov.hmcts.reform.dev.controllers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.util.Map;
import javax.sql.DataSource;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.core.env.Environment;

class InfoControllerTest {

  @Test
  @DisplayName("info() returns application name, active/default profiles and sanitized DB info")
  void infoReturnsExpectedShape() throws Exception {
    Environment env = Mockito.mock(Environment.class);
    when(env.getActiveProfiles()).thenReturn(new String[] {"test"});
    when(env.getDefaultProfiles()).thenReturn(new String[] {"default"});

    DataSource ds = Mockito.mock(DataSource.class);
    Connection connection = Mockito.mock(Connection.class);
    DatabaseMetaData meta = Mockito.mock(DatabaseMetaData.class);

    when(ds.getConnection()).thenReturn(connection);
    when(connection.getMetaData()).thenReturn(meta);
    when(meta.getDatabaseProductName()).thenReturn("PostgreSQL");
    when(meta.getDatabaseProductVersion()).thenReturn("16.3");
    when(meta.getURL())
        .thenReturn("jdbc:postgresql://user:secret@localhost:5432/appdb?sslmode=disable");

    ObjectProvider<DataSource> provider =
        new ObjectProvider<>() {
          @Override
          public DataSource getObject(Object... args) {
            return ds;
          }

          @Override
          public DataSource getIfAvailable() {
            return ds;
          }

          @Override
          public DataSource getIfUnique() {
            return ds;
          }

          @Override
          public DataSource getObject() {
            return ds;
          }
        };
    InfoController controller = new InfoController(env, provider);
    // inject app name via reflection since @Value is not processed here
    var appNameField = InfoController.class.getDeclaredField("appName");
    appNameField.setAccessible(true);
    appNameField.set(controller, "test-backend");

    Map<String, Object> info = controller.info();

    assertThat(info).containsKeys("application", "activeProfiles", "defaultProfiles", "database");
    assertThat(info.get("application")).isEqualTo("test-backend");
    assertThat((String[]) info.get("activeProfiles")).containsExactly("test");
    assertThat((String[]) info.get("defaultProfiles")).containsExactly("default");

    @SuppressWarnings("unchecked")
    Map<String, Object> db = (Map<String, Object>) info.get("database");
    assertThat(db.get("product")).isEqualTo("PostgreSQL");
    assertThat(db.get("version")).isEqualTo("16.3");
    assertThat(db.get("url"))
        .isEqualTo("jdbc:postgresql://localhost:5432/appdb"); // credentials + params stripped
  }

  @Test
  @DisplayName("sanitize leaves non-postgres URLs intact and strips query params")
  void sanitizeEdgeCases() throws Exception {
    Environment env = Mockito.mock(Environment.class);
    DataSource ds = Mockito.mock(DataSource.class);
    ObjectProvider<DataSource> provider =
        new ObjectProvider<>() {
          @Override
          public DataSource getObject(Object... args) {
            return ds;
          }

          @Override
          public DataSource getIfAvailable() {
            return ds;
          }

          @Override
          public DataSource getIfUnique() {
            return ds;
          }

          @Override
          public DataSource getObject() {
            return ds;
          }
        };
    InfoController controller = new InfoController(env, provider);
    var appNameField = InfoController.class.getDeclaredField("appName");
    appNameField.setAccessible(true);
    appNameField.set(controller, "app");

    var sanitizeMethod = InfoController.class.getDeclaredMethod("sanitize", String.class);
    sanitizeMethod.setAccessible(true);

    assertThat(
            sanitizeMethod.invoke(controller, "jdbc:h2:mem:testdb?MODE=PostgreSQL&something=else"))
        .isEqualTo("jdbc:h2:mem:testdb");
    assertThat(sanitizeMethod.invoke(controller, "jdbc:postgresql://user:pw@host/db?x=1"))
        .isEqualTo("jdbc:postgresql://host/db");
    assertThat(sanitizeMethod.invoke(controller, "jdbc:postgresql://host/db"))
        .isEqualTo("jdbc:postgresql://host/db");
  }
}
