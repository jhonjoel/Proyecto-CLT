package com.clt.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;

@Entity
@Table(name = "clt_command_log", indexes = {
        @Index(columnList = "order_id"),
        @Index(columnList = "executed_at"),
        @Index(columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommandLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "command_type", nullable = false, length = 80)
    private String commandType;

    @Column(name = "executed_by")
    private Long executedBy; // userId

    @Column(name = "executed_at", nullable = false)
    private Instant executedAt;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> payload;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private CommandLogStatus status = CommandLogStatus.SUCCESS;

    public enum CommandLogStatus {
        SUCCESS,
        FAILED
    }
}
