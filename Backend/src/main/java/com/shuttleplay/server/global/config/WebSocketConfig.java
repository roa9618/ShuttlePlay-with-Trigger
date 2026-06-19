package com.shuttleplay.server.global.config;

import com.shuttleplay.server.domain.group.enums.GroupMemberStatus;
import com.shuttleplay.server.domain.group.repository.GroupMemberRepository;
import com.shuttleplay.server.domain.group.repository.GroupSessionRepository;
import com.shuttleplay.server.domain.user.enums.UserStatus;
import com.shuttleplay.server.global.security.CustomUserDetails;
import com.shuttleplay.server.global.security.CustomUserDetailsService;
import com.shuttleplay.server.global.security.JwtTokenProvider;
import com.shuttleplay.server.global.error.BusinessException;
import com.shuttleplay.server.global.error.ErrorCode;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.beans.factory.annotation.Value;
import jakarta.servlet.http.Cookie;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private static final String BEARER_PREFIX = "Bearer ";
    private static final Pattern GROUP_TOPIC = Pattern.compile("^/topic/groups/(\\d+)(?:/.*)?$");
    private static final Pattern SESSION_TOPIC = Pattern.compile("^/topic/sessions/(\\d+)$");
    private static final String GUEST_TOKENS = "guestSessionTokens";
    private static final String ADMIN_TOPIC = "/topic/admin";

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService customUserDetailsService;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupSessionRepository groupSessionRepository;
    @Value("${app.allowed-origins:http://localhost:3000,http://localhost:5173}")
    private String[] allowedOrigins;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .addInterceptors(new HandshakeInterceptor() {
                    @Override public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler handler, Map<String, Object> attributes) {
                        Map<Long, String> tokens = new HashMap<>();
                        if (request instanceof ServletServerHttpRequest servletRequest) {
                            Cookie[] cookies = servletRequest.getServletRequest().getCookies();
                            if (cookies != null) for (Cookie cookie : cookies) {
                                if (!cookie.getName().startsWith("sp_guest_session_")) continue;
                                try { tokens.put(Long.valueOf(cookie.getName().substring("sp_guest_session_".length())), cookie.getValue()); }
                                catch (NumberFormatException ignored) { }
                            }
                        }
                        attributes.put(GUEST_TOKENS, tokens);
                        return true;
                    }
                    @Override public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler handler, Exception exception) { }
                })
                .setAllowedOriginPatterns(allowedOrigins);
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(
                        message,
                        StompHeaderAccessor.class
                );

                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    List<String> headers = accessor.getNativeHeader("Authorization");
                    String authorization = headers == null || headers.isEmpty() ? null : headers.get(0);

                    if (authorization == null || !authorization.startsWith(BEARER_PREFIX)) {
                        Map<String, Object> attributes = accessor.getSessionAttributes();
                        Object guestTokens = attributes == null ? null : attributes.get(GUEST_TOKENS);
                        if (!(guestTokens instanceof Map<?, ?> tokens) || tokens.isEmpty()) throw new BusinessException(ErrorCode.UNAUTHORIZED);
                        return message;
                    }

                    String token = authorization.substring(BEARER_PREFIX.length());
                    jwtTokenProvider.validateToken(token);
                    CustomUserDetails userDetails = customUserDetailsService.loadUserById(
                            jwtTokenProvider.getUserId(token)
                    );
                    if (!userDetails.isEnabled()) {
                        throw new BusinessException(userDetails.getStatus() == UserStatus.DELETED
                                ? ErrorCode.DELETED_USER : ErrorCode.INACTIVE_USER);
                    }
                    accessor.setUser(new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    ));
                }

                if (accessor != null && StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                    if (ADMIN_TOPIC.equals(accessor.getDestination())
                            && (!(accessor.getUser() instanceof UsernamePasswordAuthenticationToken authentication)
                            || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)
                            || userDetails.getAuthorities().stream().noneMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority())))) {
                        throw new BusinessException(ErrorCode.FORBIDDEN);
                    }
                    Matcher matcher = GROUP_TOPIC.matcher(String.valueOf(accessor.getDestination()));
                    if (matcher.matches()
                            && (!(accessor.getUser() instanceof UsernamePasswordAuthenticationToken authentication)
                            || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)
                            || (userDetails.getAuthorities().stream().noneMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()))
                            && groupMemberRepository.findByGroupIdAndUserIdAndStatus(
                                    Long.parseLong(matcher.group(1)),
                                    userDetails.getId(),
                                    GroupMemberStatus.ACTIVE
                            ).isEmpty()))) {
                        throw new BusinessException(ErrorCode.FORBIDDEN);
                    }
                    Matcher sessionMatcher = SESSION_TOPIC.matcher(String.valueOf(accessor.getDestination()));
                    if (sessionMatcher.matches()) {
                        Long sessionId = Long.valueOf(sessionMatcher.group(1));
                        boolean allowed = false;
                        if (accessor.getUser() instanceof UsernamePasswordAuthenticationToken authentication
                                && authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
                            allowed = userDetails.getAuthorities().stream().anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()))
                                    || groupSessionRepository.findById(sessionId).flatMap(session -> groupMemberRepository.findByGroupIdAndUserIdAndStatus(
                                    session.getGroup().getId(), userDetails.getId(), GroupMemberStatus.ACTIVE)).isPresent();
                        }
                        if (!allowed) {
                            Map<String, Object> attributes = accessor.getSessionAttributes();
                            Object rawTokens = attributes == null ? null : attributes.get(GUEST_TOKENS);
                            if (rawTokens instanceof Map<?, ?> tokens && tokens.get(sessionId) instanceof String token) {
                                allowed = jwtTokenProvider.getGuestSessionTokenClaims(token).filter(claims -> claims.sessionId().equals(sessionId)).isPresent();
                            }
                        }
                        if (!allowed) throw new BusinessException(ErrorCode.FORBIDDEN);
                    }
                }

                return message;
            }
        });
    }
}
