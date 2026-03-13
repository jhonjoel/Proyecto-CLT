package com.clt.service;

import com.clt.command.OrderCommand;
import com.clt.entity.CommandLog;
import com.clt.repository.CommandLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;

/**
 * Delega la ejecución de comandos sobre pedidos y persiste cada ejecución en command_log.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CommandExecutorService {

    private final CommandLogRepository commandLogRepository;

    @Transactional
    public void execute(OrderCommand command, Long orderId, Long executedByUserId, Map<String, Object> payload) {
        String commandType = command.getClass().getSimpleName();
        Instant executedAt = Instant.now();
        try {
            command.execute();
            Long logOrderId = orderId != null ? orderId : command.getOrderIdForLog();
            commandLogRepository.save(CommandLog.builder()
                    .orderId(logOrderId)
                    .commandType(commandType)
                    .executedBy(executedByUserId)
                    .executedAt(executedAt)
                    .payload(payload)
                    .status(CommandLog.CommandLogStatus.SUCCESS)
                    .build());
        } catch (Exception e) {
            log.warn("Command {} failed for order {}: {}", commandType, orderId, e.getMessage());
            Long logOrderId = orderId != null ? orderId : command.getOrderIdForLog();
            commandLogRepository.save(CommandLog.builder()
                    .orderId(logOrderId)
                    .commandType(commandType)
                    .executedBy(executedByUserId)
                    .executedAt(executedAt)
                    .payload(payload != null ? Map.of("error", e.getMessage()) : null)
                    .status(CommandLog.CommandLogStatus.FAILED)
                    .build());
            throw e;
        }
    }
}
