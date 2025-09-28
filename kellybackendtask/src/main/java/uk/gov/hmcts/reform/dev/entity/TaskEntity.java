package uk.gov.hmcts.reform.dev.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import uk.gov.hmcts.reform.dev.models.Status;

@Entity
@Table(name = "task")
@Getter
@Setter
@ToString
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
@Builder
/**
 * JPA entity mapped to table {@code task}.
 *
 * <p>Represents the persisted form of a task. Enum {@link Status} is stored as VARCHAR for
 * portability across database engines (H2/Postgres). Column lengths chosen to constrain storage
 * while allowing typical short descriptions.
 */
public class TaskEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(length = 100)
  private String title;

  @Column(length = 200)
  private String description;

  @Enumerated(EnumType.STRING)
  // Use plain VARCHAR mapping for portability across H2 (tests) and Postgres
  // (enum handled by Flyway DDL)
  @JdbcTypeCode(SqlTypes.VARCHAR)
  private Status status;

  @Column(name = "duedate")
  private LocalDateTime dueDate;

  @Column(name = "tasknum")
  private Integer tasknum;
}
