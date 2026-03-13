package com.clt.dto;

import com.clt.entity.CommandLog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommandLogDto {

    private Long id;
    private Long orderId;
    private String commandType;
    private Long executedBy;
    private Instant executedAt;
    private Map<String, Object> payload;
    private CommandLog.CommandLogStatus status;
}
