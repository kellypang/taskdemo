package uk.gov.hmcts.reform.dev.entity.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import uk.gov.hmcts.reform.dev.models.Status;

/**
 * JPA attribute converter for {@link Status} enum to String.
 *
 * <p>Currently unused (autoApply=false) because fields use @Enumerated with VARCHAR mapping. Kept
 * as a reference for scenarios where custom transformation might be needed.
 */
@Converter(autoApply = false)
public class StatusEnumConverter implements AttributeConverter<Status, String> {

  @Override
  public String convertToDatabaseColumn(Status attribute) {
    if (attribute == null) {
      return null;
    }
    // Persist DB enum label exactly as defined in Flyway migration (upper-case)
    return attribute.name();
  }

  @Override
  public Status convertToEntityAttribute(String dbData) {
    if (dbData == null) {
      return null;
    }
    // Read DB enum label directly via enum name
    return Status.valueOf(dbData);
  }
}
