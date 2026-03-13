package com.clt.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Servicio para enviar emails. Si SMTP no está configurado, registra el enlace en consola (desarrollo).
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    public EmailService(@org.springframework.beans.factory.annotation.Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @org.springframework.beans.factory.annotation.Value("${app.frontend-url:http://localhost:4200}")
    private String frontendUrl;

    /**
     * Envía email con enlace para restablecer contraseña.
     * Si SMTP no está configurado, registra el enlace en consola.
     */
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        String resetLink = frontendUrl + "/#/auth/reset-password?token=" + resetToken;

        if (isMailConfigured()) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(toEmail);
                message.setSubject("Restablecer contraseña - CLT OMS");
                message.setText("Hola,\n\nSolicitaste restablecer tu contraseña. Haz clic en el siguiente enlace (válido 1 hora):\n\n"
                        + resetLink + "\n\nSi no solicitaste este cambio, ignora este correo.");
                mailSender.send(message);
                log.info("Email de restablecimiento enviado a {}", toEmail);
            } catch (Exception e) {
                log.warn("Error enviando email a {}, enlace en consola: {}", toEmail, resetLink, e);
            }
        } else {
            log.info(">>> SMTP no configurado. Enlace de restablecimiento para {}: {}", toEmail, resetLink);
        }
    }

    private boolean isMailConfigured() {
        return mailSender != null;
    }
}
