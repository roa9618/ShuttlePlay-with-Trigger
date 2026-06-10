package com.shuttleplay.server.domain.auth.service;

import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.domain.user.enums.AuthProvider;
import com.shuttleplay.server.domain.user.repository.UserRepository;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomOidcUserService extends OidcUserService {
    private final UserRepository userRepository;

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        AuthProvider provider = AuthProvider.valueOf(registrationId.toUpperCase());

        String providerId = oidcUser.getSubject();
        String email = oidcUser.getEmail();
        String name = oidcUser.getFullName();
        String profileImageUrl = oidcUser.getPicture();

        validateOidcUserInfo(providerId, email);

        User user = findOrCreateUser(
                provider,
                providerId,
                email,
                name,
                profileImageUrl
        );

        Map<String, Object> attributes = new HashMap<>(oidcUser.getAttributes());

        attributes.put("userId", user.getId());
        attributes.put("profileCompleted", user.isProfileCompleted());

        return new DefaultOidcUser(
                java.util.Collections.singleton(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())),
                oidcUser.getIdToken(),
                oidcUser.getUserInfo(),
                "sub"
        ) {
            @Override
            public Map<String, Object> getAttributes() {
                return attributes;
            }

            @Override
            public <A> A getAttribute(String name) {
                return (A) attributes.get(name);
            }
        };
    }

    private void validateOidcUserInfo(String providerId, String email) {
        if (!StringUtils.hasText(providerId)) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("oidc_provider_id_not_found"),
                    "소셜 계정 식별값을 찾을 수 없습니다."
            );
        }

        if (!StringUtils.hasText(email)) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("oidc_email_not_found"),
                    "소셜 계정 이메일을 찾을 수 없습니다."
            );
        }
    }

    private User findOrCreateUser(
            AuthProvider provider,
            String providerId,
            String email,
            String name,
            String profileImageUrl
    ) {
        return userRepository.findByProviderAndProviderId(provider, providerId)
                .orElseGet(() -> createSocialUser(
                        provider,
                        providerId,
                        email,
                        name,
                        profileImageUrl
                ));
    }

    private User createSocialUser(
            AuthProvider provider,
            String providerId,
            String email,
            String name,
            String profileImageUrl
    ) {
        String socialName = StringUtils.hasText(name)
                ? name
                : provider.name() + " 사용자";

        User user = User.createSocialUser(
                email,
                socialName,
                provider,
                providerId,
                profileImageUrl
        );

        return userRepository.save(user);
    }
}