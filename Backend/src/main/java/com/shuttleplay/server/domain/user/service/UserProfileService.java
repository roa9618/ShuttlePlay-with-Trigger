package com.shuttleplay.server.domain.user.service;

import com.shuttleplay.server.domain.user.dto.request.ProfileCompletionRequest;
import com.shuttleplay.server.domain.user.dto.response.ProfileCompletionFormResponse;
import com.shuttleplay.server.domain.user.dto.response.ProfileCompletionResponse;
import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.domain.user.repository.UserRepository;
import com.shuttleplay.server.domain.user.util.InitialMmrCalculator;
import com.shuttleplay.server.global.error.BusinessException;
import com.shuttleplay.server.global.error.ErrorCode;
import java.lang.reflect.Method;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserProfileService {
    private final UserRepository userRepository;

    public ProfileCompletionFormResponse getProfileCompletionForm(Authentication authentication) {
        User user = getCurrentUser(authentication);

        return ProfileCompletionFormResponse.from(user);
    }

    @Transactional
    public ProfileCompletionResponse completeProfile(
            Authentication authentication,
            ProfileCompletionRequest request
    ) {
        User user = getCurrentUser(authentication);

        int initialMmr = InitialMmrCalculator.calculate(request.grade());

        user.completeProfile(
                request.name(),
                request.gender(),
                request.ageGroup(),
                request.grade(),
                initialMmr
        );

        return ProfileCompletionResponse.from(user);
    }

    private User getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        Object principal = authentication.getPrincipal();

        Long userId = extractUserId(principal);

        if (userId != null) {
            return userRepository.findById(userId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        }

        String username = extractUsername(authentication, principal);

        if (StringUtils.hasText(username) && username.matches("\\d+")) {
            Long idFromUsername = Long.valueOf(username);

            return userRepository.findById(idFromUsername)
                    .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        }

        if (StringUtils.hasText(username)) {
            return userRepository.findByEmail(username)
                    .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        }

        throw new BusinessException(ErrorCode.USER_NOT_FOUND);
    }

    private Long extractUserId(Object principal) {
        if (principal == null) {
            return null;
        }

        if (principal instanceof Long userId) {
            return userId;
        }

        if (principal instanceof Number number) {
            return number.longValue();
        }

        Object idValue = invokeNoArgMethod(principal, "getId");

        if (idValue instanceof Number number) {
            return number.longValue();
        }

        Object userIdValue = invokeNoArgMethod(principal, "getUserId");

        if (userIdValue instanceof Number number) {
            return number.longValue();
        }

        return null;
    }

    private String extractUsername(Authentication authentication, Object principal) {
        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        }

        if (principal instanceof String principalText && !"anonymousUser".equals(principalText)) {
            return principalText;
        }

        Object emailValue = invokeNoArgMethod(principal, "getEmail");

        if (emailValue instanceof String email) {
            return email;
        }

        Object usernameValue = invokeNoArgMethod(principal, "getUsername");

        if (usernameValue instanceof String username) {
            return username;
        }

        String authenticationName = authentication.getName();

        if (StringUtils.hasText(authenticationName) && !"anonymousUser".equals(authenticationName)) {
            return authenticationName;
        }

        return null;
    }

    private Object invokeNoArgMethod(Object target, String methodName) {
        if (target == null) {
            return null;
        }

        try {
            Method method = target.getClass().getMethod(methodName);

            return method.invoke(target);
        } catch (ReflectiveOperationException exception) {
            return null;
        }
    }
}