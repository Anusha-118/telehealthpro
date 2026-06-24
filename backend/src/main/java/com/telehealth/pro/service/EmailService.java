package com.telehealth.pro.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${mail.from:no-reply@telehealthpro.com}")
    private String mailFrom;

    public void sendEmail(String to, String subject, String text, String html) {
        System.out.println("[EMAIL MOCK] Sending email to: " + to);
        System.out.println("[EMAIL MOCK] Subject: " + subject);
        System.out.println("[EMAIL MOCK] Text: " + text);

        if (mailSender != null) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(mailFrom);
                helper.setTo(to);
                helper.setSubject(subject);
                if (html != null) {
                    helper.setText(html, true);
                } else {
                    helper.setText(text, false);
                }
                mailSender.send(message);
                System.out.println("[EMAIL] Email sent successfully via SMTP.");
            } catch (Exception e) {
                System.err.println("[EMAIL ERROR] Failed to send email via SMTP: " + e.getMessage());
            }
        } else {
            System.out.println("[EMAIL] SMTP MailSender not configured. Email mock log only.");
        }
    }
}
