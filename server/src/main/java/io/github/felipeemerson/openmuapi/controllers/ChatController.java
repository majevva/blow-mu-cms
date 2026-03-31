package io.github.felipeemerson.openmuapi.controllers;

import io.github.felipeemerson.openmuapi.dto.ChatMessageDTO;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.security.Principal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Controller
public class ChatController {

    private static final int MAX_HISTORY = 50;
    private final List<ChatMessageDTO> messageHistory = Collections.synchronizedList(new ArrayList<>());

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
        String loginName = (principal != null) ? principal.getName() : "Anonymous";
        String content = chatMessage.getContent();
        if (content == null || content.isBlank()) {
            return null;
        }
        // Sanitize: strip HTML tags, limit length
        content = content.replaceAll("<[^>]*>", "").trim();
        if (content.length() > 200) {
            content = content.substring(0, 200);
        }

        ChatMessageDTO message = ChatMessageDTO.builder()
                .loginName(loginName)
                .content(content)
                .timestamp(Instant.now())
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
        String loginName = headerAccessor.getUser() != null ? headerAccessor.getUser().getName() : "Anonymous";

        return ChatMessageDTO.builder()
                .loginName(loginName)
                .content(loginName + " joined the chat")
                .timestamp(Instant.now())
                .type(ChatMessageDTO.MessageType.JOIN)
                .build();
    }
}
