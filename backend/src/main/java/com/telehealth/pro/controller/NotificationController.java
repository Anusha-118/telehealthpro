package com.telehealth.pro.controller;

import com.telehealth.pro.dto.ApiResponse;
import com.telehealth.pro.entity.Notification;
import com.telehealth.pro.entity.User;
import com.telehealth.pro.repository.NotificationRepository;
import com.telehealth.pro.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<?> listNotifications(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User currentUser = userDetails.getUser();
        List<Notification> notifications = notificationRepository
                .findAllByUser_IdOrderByCreatedAtDesc(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @PutMapping("/{id}/read")
    @Transactional
    public ResponseEntity<?> markAsRead(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id) {
        
        User currentUser = userDetails.getUser();

        if ("all".equalsIgnoreCase(id)) {
            notificationRepository.markAllAsReadForUser(currentUser.getId());
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("All notifications marked as read.")
                    .build());
        }

        try {
            Long notificationId = Long.parseLong(id);
            Optional<Notification> notificationOpt = notificationRepository
                    .findByNotificationIdAndUser_Id(notificationId, currentUser.getId());
            
            if (notificationOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Notification not found."));
            }

            Notification notification = notificationOpt.get();
            notification.setRead(true);
            notification = notificationRepository.save(notification);

            return ResponseEntity.ok(ApiResponse.success("Notification marked as read.", notification));
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid notification ID format."));
        }
    }
}
