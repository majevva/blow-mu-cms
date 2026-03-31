package io.github.felipeemerson.openmuapi.controllers;

import io.github.felipeemerson.openmuapi.dto.ChatMessageDTO;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.security.Principal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class ChatController {

    private static final int MAX_HISTORY = 50;
    private static final int MAX_LENGTH = 200;
    private static final long SLOW_MODE_MS = 3000L;

    private final List<ChatMessageDTO> messageHistory = Collections.synchronizedList(new ArrayList<>());
    private final ConcurrentHashMap<String, Instant> lastMessageTime = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, String> lastMessageContent = new ConcurrentHashMap<>();

    @GetMapping("/chat/history")
    @ResponseBody
    public List<ChatMessageDTO> getHistory() {
        synchronized (messageHistory) {
            return new ArrayList<>(messageHistory);
        }
    }

    @MessageMapping("/chat.send")
    @SendTo("/topic/chat")
    public ChatMessageDTO sendMessage(@Payload ChatMessageDTO chatMessage, Principal principal) {
        if (principal == null) {
            throw new AccessDeniedException("Authentication required to send messages");
        }

        String loginName = principal.getName();
        String content = chatMessage.getContent();

        if (content == null || content.isBlank()) {
            return null;
        }

        content = content.trim();

        // Strict XSS / injection rejection
        if (content.contains("<") || content.contains(">")) {
            return null;
        }
        if (content.toLowerCase().contains("javascript:")) {
            return null;
        }

        // Length limit
        if (content.length() > MAX_LENGTH) {
            content = content.substring(0, MAX_LENGTH);
        }

        // Slow mode check
        Instant now = Instant.now();
        Instant last = lastMessageTime.get(loginName);
        if (last != null) {
            long elapsed = now.toEpochMilli() - last.toEpochMilli();
            if (elapsed < SLOW_MODE_MS) {
                long remaining = SLOW_MODE_MS - elapsed;
                throw new MessageDeliveryException("SLOW_MODE:" + remaining);
            }
        }

        // Anti-spam: reject duplicate consecutive message
        String lastContent = lastMessageContent.get(loginName);
        if (content.equals(lastContent)) {
            return null;
        }

        // Record state
        lastMessageTime.put(loginName, now);
        lastMessageContent.put(loginName, content);

        ChatMessageDTO message = ChatMessageDTO.builder()
                .loginName(loginName)
                .content(content)
                .timestamp(now)
                .type(ChatMessageDTO.MessageType.CHAT)
                .build();

        synchronized (messageHistory) {
            messageHistory.add(message);
            if (messageHistory.size() > MAX_HISTORY) {
                messageHistory.remove(0);
            }
        }

        return message;
    }

    @MessageMapping("/chat.join")
    @SendTo("/topic/chat")
    public ChatMessageDTO joinChat(SimpMessageHeaderAccessor headerAccessor) {
        if (headerAccessor.getUser() == null) {
            return null;
        }
        String loginName = headerAccessor.getUser().getName();
        return ChatMessageDTO.builder()
                .loginName(loginName)
                .content(loginName + " joined the chat")
                .timestamp(Instant.now())
                .type(ChatMessageDTO.MessageType.JOIN)
                .build();
    }
}
