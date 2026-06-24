package com.telehealth.pro.controller;

import com.telehealth.pro.dto.ApiResponse;
import com.telehealth.pro.entity.Message;
import com.telehealth.pro.entity.User;
import com.telehealth.pro.repository.MessageRepository;
import com.telehealth.pro.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@PreAuthorize("isAuthenticated()")
public class ChatController {

    @Autowired
    private MessageRepository messageRepository;

    @GetMapping("/history/{otherUserId}")
    public ResponseEntity<?> getChatHistory(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long otherUserId) {
        
        User currentUser = userDetails.getUser();

        if (otherUserId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Target peer User ID is required."));
        }

        List<Message> history = messageRepository.findConversation(currentUser.getId(), otherUserId);
        return ResponseEntity.ok(ApiResponse.success(history));
    }
}
