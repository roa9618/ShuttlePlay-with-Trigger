package com.shuttleplay.server.domain.auth.service;

import com.shuttleplay.server.domain.auth.oauth.OAuth2UserInfo;
import com.shuttleplay.server.domain.auth.oauth.OAuth2UserInfoFactory;
import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.domain.user.repository.UserRepository;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        String registrationId = userRequest.getClientRegistration().getRegistrationId();

        OAuth2UserInfo userInfo = OAuth2UserInfoFactory.create(
                registrationId,
                oauth2User.getAttributes()
        );

        validateOAuth2UserInfo(userInfo);

        User user = findOrCreateUser(userInfo);

        Map<String, Object> attributes = new HashMap<>(userInfo.getAttributes());

        attributes.put("userId", user.getId());
        attributes.put("profileCompleted", user.isProfileCompleted());

        return new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())),
                attributes,
                userInfo.getNameAttributeKey()
        );
    }

    private void validateOAuth2UserInfo(OAuth2UserInfo userInfo) {
        if (!StringUtils.hasText(userInfo.getProviderId())) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("oauth2_provider_id_not_found"),
                    "소셜 계정 식별값을 찾을 수 없습니다."
            );
        }

        if (!StringUtils.hasText(userInfo.getEmail())) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("oauth2_email_not_found"),
                    "소셜 계정 이메일을 찾을 수 없습니다."
            );
        }
    }

    private User findOrCreateUser(OAuth2UserInfo userInfo) {
        return userRepository.findByProviderAndProviderId(
                        userInfo.getProvider(),
                        userInfo.getProviderId()
                )
                .orElseGet(() -> createSocialUser(userInfo));
    }

    private User createSocialUser(OAuth2UserInfo userInfo) {
        String name = StringUtils.hasText(userInfo.getName())
                ? userInfo.getName()
                : userInfo.getProvider().name() + " 사용자";

        User user = User.createSocialUser(
                userInfo.getEmail(),
                name,
                userInfo.getProvider(),
                userInfo.getProviderId(),
                userInfo.getProfileImageUrl()
        );

        return userRepository.save(user);
    }
}