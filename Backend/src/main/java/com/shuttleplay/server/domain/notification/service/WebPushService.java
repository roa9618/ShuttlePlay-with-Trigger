package com.shuttleplay.server.domain.notification.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shuttleplay.server.domain.notification.config.WebPushProperties;
import com.shuttleplay.server.domain.notification.dto.request.PushSubscriptionRequest;
import com.shuttleplay.server.domain.notification.dto.response.NotificationItemResponse;
import com.shuttleplay.server.domain.notification.dto.response.WebPushConfigResponse;
import com.shuttleplay.server.domain.notification.entity.PushSubscription;
import com.shuttleplay.server.domain.notification.repository.PushSubscriptionRepository;
import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.domain.user.repository.UserRepository;
import com.shuttleplay.server.global.error.BusinessException;
import com.shuttleplay.server.global.error.ErrorCode;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.Security;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import org.apache.http.HttpResponse;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.jose4j.lang.JoseException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WebPushService {
    private final WebPushProperties properties;
    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @PostConstruct
    void registerSecurityProvider() {
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
    }

    public WebPushConfigResponse getConfig() {
        return new WebPushConfigResponse(
                properties.isEnabled(),
                properties.isEnabled() ? properties.getPublicKey() : ""
        );
    }

    @Transactional
    public void subscribe(Long userId, PushSubscriptionRequest request) {
        if (!properties.isEnabled()) {
            return;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        String endpointHash = hashEndpoint(request.endpoint());
        PushSubscription subscription = pushSubscriptionRepository.findByEndpointHash(endpointHash)
                .orElseGet(() -> PushSubscription.create(
                        user,
                        request.endpoint(),
                        endpointHash,
                        request.keys().p256dh(),
                        request.keys().auth()
                ));

        subscription.update(
                user,
                request.endpoint(),
                endpointHash,
                request.keys().p256dh(),
                request.keys().auth()
        );
        pushSubscriptionRepository.save(subscription);
    }

    @Transactional
    public void unsubscribe(Long userId, String endpoint) {
        pushSubscriptionRepository.deleteByEndpointHashAndUserId(hashEndpoint(endpoint), userId);
    }

    @Transactional
    public void send(Long userId, NotificationItemResponse notification) {
        if (!properties.isEnabled()) {
            log.warn("Web push delivery skipped because web push configuration is disabled");
            return;
        }

        String payload = createPayload(notification);
        List<PushSubscription> subscriptions = pushSubscriptionRepository.findAllByUserId(userId);

        if (subscriptions.isEmpty()) {
            log.debug("Web push delivery skipped because user {} has no subscription", userId);
            return;
        }

        for (PushSubscription subscription : subscriptions) {
            send(subscription, payload);
        }
    }

    private String createPayload(NotificationItemResponse notification) {
        try {
            return objectMapper.writeValueAsString(Map.of(
                    "id", notification.getId(),
                    "type", notification.getType().name(),
                    "title", notification.getTitle(),
                    "message", notification.getMessage(),
                    "targetPath", notification.getTargetPath()
            ));
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Failed to serialize web push payload", exception);
        }
    }

    private void send(PushSubscription subscription, String payload) {
        try {
            PushService pushService = new PushService(
                    properties.getPublicKey(),
                    properties.getPrivateKey(),
                    properties.getSubject()
            );
            Notification notification = new Notification(
                    subscription.getEndpoint(),
                    subscription.getP256dh(),
                    subscription.getAuth(),
                    payload
            );
            HttpResponse response = pushService.send(notification);
            int statusCode = response.getStatusLine().getStatusCode();

            if (statusCode == 404 || statusCode == 410) {
                pushSubscriptionRepository.deleteByEndpointHash(subscription.getEndpointHash());
            } else if (statusCode < 200 || statusCode >= 300) {
                log.warn(
                        "Web push delivery rejected for subscription {} with status {}",
                        subscription.getId(),
                        statusCode
                );
            } else {
                log.debug(
                        "Web push delivered for subscription {} with status {}",
                        subscription.getId(),
                        statusCode
                );
            }
        } catch (GeneralSecurityException | ExecutionException | IOException | JoseException exception) {
            log.warn("Web push delivery failed for subscription {}", subscription.getId(), exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            log.warn("Web push delivery interrupted for subscription {}", subscription.getId(), exception);
        }
    }

    private String hashEndpoint(String endpoint) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(endpoint.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }
}
