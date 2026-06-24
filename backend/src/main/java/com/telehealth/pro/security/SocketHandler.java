package com.telehealth.pro.security;

import com.telehealth.pro.service.SocketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.UUID;

@Component
public class SocketHandler extends TextWebSocketHandler {

    @Autowired
    private SocketService socketService;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        System.out.println("[SOCKET] Client connected: " + session.getId());
        
        // Emulate Socket.io open packet
        String sid = UUID.randomUUID().toString().replace("-", "");
        String handshake = String.format("0{\"sid\":\"%s\",\"upgrades\":[],\"pingInterval\":25000,\"pingTimeout\":20000}", sid);
        session.sendMessage(new TextMessage(handshake));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        socketService.handleMessage(session, message.getPayload());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        System.out.println("[SOCKET] Client disconnected: " + session.getId());
        socketService.removeSession(session);
    }
}
