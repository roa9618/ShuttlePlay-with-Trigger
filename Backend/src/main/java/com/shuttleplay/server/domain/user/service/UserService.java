package com.shuttleplay.server.domain.user.service;

import com.shuttleplay.server.domain.auth.entity.RefreshToken;
import com.shuttleplay.server.domain.auth.repository.RefreshTokenRepository;
import com.shuttleplay.server.domain.user.dto.request.UpdateNotificationSettingsRequest;
import com.shuttleplay.server.domain.user.dto.request.UpdatePasswordRequest;
import com.shuttleplay.server.domain.user.dto.request.UpdateUserProfileRequest;
import com.shuttleplay.server.domain.user.dto.response.CurrentUserResponse;
import com.shuttleplay.server.domain.user.dto.response.UserNotificationSettingsResponse;
import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.domain.user.entity.UserNotificationSettings;
import com.shuttleplay.server.domain.user.enums.AuthProvider;
import com.shuttleplay.server.domain.user.repository.UserNotificationSettingsRepository;
import com.shuttleplay.server.domain.user.repository.UserRepository;
import com.shuttleplay.server.global.error.BusinessException;
import com.shuttleplay.server.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {
    private final UserRepository userRepository;
    private final UserNotificationSettingsRepository notificationSettingsRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;

    public CurrentUserResponse getCurrentUser(Long userId) {
        return CurrentUserResponse.from(findUser(userId));
    }

    @Transactional
    public CurrentUserResponse updateProfile(Long userId, UpdateUserProfileRequest request) {
        User user = findUser(userId);

        user.updateProfile(
                request.name(),
                request.gender(),
                request.ageGroup(),
                request.grade()
        );

        return CurrentUserResponse.from(user);
    }

    @Transactional
    public CurrentUserResponse updateProfileImage(Long userId, String imageUrl) {
        User user = findUser(userId);

        user.updateProfileImageUrl(imageUrl);

        return CurrentUserResponse.from(user);
    }

    @Transactional
    public CurrentUserResponse deleteProfileImage(Long userId) {
        User user = findUser(userId);

        user.updateProfileImageUrl(null);

        return CurrentUserResponse.from(user);
    }

    @Transactional
    public void updatePassword(Long userId, UpdatePasswordRequest request) {
        User user = findUser(userId);

        if (user.getProvider() != AuthProvider.LOCAL) {
            throw new BusinessException(
                    ErrorCode.SOCIAL_ACCOUNT_LOGIN_NOT_ALLOWED,
                    "소셜 로그인 계정은 비밀번호를 변경할 수 없습니다."
            );
        }

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_PASSWORD);
        }

        if (!request.newPassword().equals(request.newPasswordConfirm())) {
            throw new BusinessException(ErrorCode.PASSWORD_CONFIRM_NOT_MATCH);
        }

        user.updatePassword(passwordEncoder.encode(request.newPassword()));
        refreshTokenRepository.findAllByUserIdAndRevokedFalse(user.getId())
                .forEach(RefreshToken::revoke);
    }

    @Transactional
    public UserNotificationSettingsResponse getNotificationSettings(Long userId) {
        UserNotificationSettings settings = getOrCreateNotificationSettings(findUser(userId));

        return UserNotificationSettingsResponse.from(settings);
    }

    @Transactional
    public UserNotificationSettingsResponse updateNotificationSettings(
            Long userId,
            UpdateNotificationSettingsRequest request
    ) {
        UserNotificationSettings settings = getOrCreateNotificationSettings(findUser(userId));

        settings.update(
                request.nextMatchEnabled(),
                request.matchStartEnabled(),
                request.courtChangeEnabled(),
                request.resultRequestEnabled(),
                request.scheduleChangeEnabled()
        );

        return UserNotificationSettingsResponse.from(settings);
    }

    @Transactional
    public void deleteAccount(Long userId) {
        User user = findUser(userId);

        refreshTokenRepository.findAllByUserIdAndRevokedFalse(userId)
                .forEach(RefreshToken::revoke);
        user.deleteUser();
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }

    private UserNotificationSettings getOrCreateNotificationSettings(User user) {
        return notificationSettingsRepository.findByUserId(user.getId())
                .orElseGet(() -> notificationSettingsRepository.save(
                        UserNotificationSettings.createDefault(user)
                ));
    }
}
