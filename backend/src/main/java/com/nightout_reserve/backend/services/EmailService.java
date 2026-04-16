package com.nightout_reserve.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendResetEmail(String to, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("nightoutreserve@gmail.com");
        message.setTo(to);
        message.setSubject("Jelszó visszaállítás - Night-Out Reserve");
        message.setText("A jelszavad visszaállításához kattints az alábbi linkre:\n" +
                "http://nigth-out-reserve.org/jelszo-csere.html?token=" + token);

        mailSender.send(message);
    }
}