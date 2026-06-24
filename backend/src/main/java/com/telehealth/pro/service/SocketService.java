package com.telehealth.pro.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.telehealth.pro.entity.Message;
import com.telehealth.pro.entity.Notification;
import com.telehealth.pro.entity.User;
import com.telehealth.pro.repository.MessageRepository;
import com.telehealth.pro.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@Service
public class SocketService {

    private final Map<Long, Set<WebSocketSession>> activeSessions = new ConcurrentHashMap<>();
    private final Map<String, Long> sessionToUserMap = new ConcurrentHashMap<>();

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    @Lazy
    private MessageRepository messageRepository;

    @Autowired
    @Lazy
    private UserRepository userRepository;

    public void registerSession(WebSocketSession session, Long userId) {
        sessionToUserMap.put(session.getId(), userId);
        activeSessions.computeIfAbsent(userId, k -> new CopyOnWriteArraySet<>()).add(session);
        System.out.println("[SOCKET] Registered UserID " + userId + " on session " + session.getId());
    }

    public void removeSession(WebSocketSession session) {
        Long userId = sessionToUserMap.remove(session.getId());
        if (userId != null) {
            Set<WebSocketSession> sessions = activeSessions.get(userId);
            if (sessions != null) {
                sessions.remove(session);
                if (sessions.isEmpty()) {
                    activeSessions.remove(userId);
                }
            }
            System.out.println("[SOCKET] Deregistered UserID " + userId + " from session " + session.getId());
        }
    }

    public void handleMessage(WebSocketSession session, String payload) {
        try {
            if (payload.equals("2")) {
                session.sendMessage(new TextMessage("3"));
                return;
            }

            if (payload.equals("40")) {
                session.sendMessage(new TextMessage("40"));
                return;
            }

            if (payload.startsWith("42")) {
                String arrayJson = payload.substring(2);
                ArrayNode arrayNode = (ArrayNode) objectMapper.readTree(arrayJson);
                String eventName = arrayNode.get(0).asText();
                var eventData = arrayNode.get(1);

                if ("register".equals(eventName)) {
                    Long userId = eventData.isNumber() ? eventData.asLong() : Long.parseLong(eventData.asText());
                    registerSession(session, userId);
                } else if ("send_message".equals(eventName)) {
                    Long senderId = eventData.get("senderId").asLong();
                    Long receiverId = eventData.get("receiverId").asLong();
                    String msgText = eventData.get("message").asText();

                    User sender = userRepository.findById(senderId).orElse(null);
                    User receiver = userRepository.findById(receiverId).orElse(null);

                    if (sender != null && receiver != null) {
                        Message chatMessage = Message.builder()
                                .sender(sender)
                                .receiver(receiver)
                                .message(msgText)
                                .build();
                        chatMessage = messageRepository.save(chatMessage);

                        broadcastToUser(senderId, "receive_message", chatMessage, session.getId());
                        broadcastToUser(receiverId, "receive_message", chatMessage, null);
                    }
                } else if ("webrtc_offer".equals(eventName)) {
                    Long toUserId = eventData.get("toUserId").asLong();
                    broadcastToUser(toUserId, "webrtc_offer", eventData, null);
                } else if ("webrtc_answer".equals(eventName)) {
                    Long toUserId = eventData.get("toUserId").asLong();
                    broadcastToUser(toUserId, "webrtc_answer", eventData, null);
                } else if ("webrtc_ice_candidate".equals(eventName)) {
                    Long toUserId = eventData.get("toUserId").asLong();
                    broadcastToUser(toUserId, "webrtc_ice_candidate", eventData, null);
                } else if ("webrtc_hangup".equals(eventName)) {
                    Long toUserId = eventData.get("toUserId").asLong();
                    broadcastToUser(toUserId, "webrtc_hangup", eventData, null);
                }
            }
        } catch (Exception e) {
            System.err.println("[SOCKET ERROR] Failed to handle payload: " + e.getMessage());
        }
    }

    public void notifyUser(Long userId, Notification notification) {
        broadcastToUser(userId, "push_notification", notification, null);
    }

    private void broadcastToUser(Long userId, String eventName, Object data, String excludeSessionId) {
        Set<WebSocketSession> sessions = activeSessions.getOrDefault(userId, Collections.emptySet());
        if (sessions.isEmpty()) {
            return;
        }

        try {
            String dataJson = objectMapper.writeValueAsString(data);
            String frame = String.format("42[\"%s\",%s]", eventName, dataJson);
            TextMessage message = new TextMessage(frame);

            for (WebSocketSession session : sessions) {
                if (session.isOpen() && (excludeSessionId == null || !session.getId().equals(excludeSessionId))) {
                    session.sendMessage(message);
                }
            }
        } catch (IOException e) {
            System.err.println("[SOCKET ERROR] Failed to broadcast: " + e.getMessage());
        }
    }
}
