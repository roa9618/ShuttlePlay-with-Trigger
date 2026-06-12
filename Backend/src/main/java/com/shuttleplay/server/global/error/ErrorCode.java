package com.shuttleplay.server.global.error;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "INVALID_REQUEST", "요청값이 올바르지 않습니다."),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "인증이 필요합니다."),
    FORBIDDEN(HttpStatus.FORBIDDEN, "FORBIDDEN", "접근 권한이 없습니다."),
    NOT_FOUND(HttpStatus.NOT_FOUND, "NOT_FOUND", "리소스를 찾을 수 없습니다."),
    CONFLICT(HttpStatus.CONFLICT, "CONFLICT", "이미 존재하거나 충돌이 발생했습니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR", "서버 내부 오류가 발생했습니다."),

    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "사용자를 찾을 수 없습니다."),
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "DUPLICATE_EMAIL", "이미 사용 중인 이메일입니다."),
    SIGNUP_AGREEMENT_REQUIRED(HttpStatus.BAD_REQUEST, "SIGNUP_AGREEMENT_REQUIRED", "이용약관 및 개인정보 처리방침 동의는 필수입니다."),
    INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "INVALID_PASSWORD", "비밀번호가 일치하지 않습니다."),
    PASSWORD_CONFIRM_NOT_MATCH(HttpStatus.BAD_REQUEST, "PASSWORD_CONFIRM_NOT_MATCH", "비밀번호와 비밀번호 확인이 일치하지 않습니다."),
    INACTIVE_USER(HttpStatus.FORBIDDEN, "INACTIVE_USER", "비활성화된 사용자입니다."),
    DELETED_USER(HttpStatus.FORBIDDEN, "DELETED_USER", "탈퇴한 사용자입니다."),
    SOCIAL_ACCOUNT_LOGIN_NOT_ALLOWED(HttpStatus.BAD_REQUEST, "SOCIAL_ACCOUNT_LOGIN_NOT_ALLOWED", "소셜 로그인 계정은 일반 로그인을 사용할 수 없습니다."),
    SOCIAL_ACCOUNT_CANNOT_LOGIN_WITH_PASSWORD(HttpStatus.BAD_REQUEST, "SOCIAL_ACCOUNT_CANNOT_LOGIN_WITH_PASSWORD", "소셜 로그인으로 가입된 계정입니다. 소셜 로그인을 이용해주세요."),
    SOCIAL_ACCOUNT_CANNOT_RESET_PASSWORD(HttpStatus.BAD_REQUEST, "SOCIAL_ACCOUNT_CANNOT_RESET_PASSWORD", "소셜 로그인 계정은 비밀번호 재설정을 사용할 수 없습니다."),

    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "INVALID_TOKEN", "유효하지 않은 토큰입니다."),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "EXPIRED_TOKEN", "만료된 토큰입니다."),
    BLACKLISTED_TOKEN(HttpStatus.UNAUTHORIZED, "BLACKLISTED_TOKEN", "로그아웃되어 사용할 수 없는 토큰입니다."),

    REFRESH_TOKEN_NOT_FOUND(HttpStatus.UNAUTHORIZED, "REFRESH_TOKEN_NOT_FOUND", "Refresh Token을 찾을 수 없습니다."),
    INVALID_REFRESH_TOKEN(HttpStatus.UNAUTHORIZED, "INVALID_REFRESH_TOKEN", "유효하지 않은 Refresh Token입니다."),
    EXPIRED_REFRESH_TOKEN(HttpStatus.UNAUTHORIZED, "EXPIRED_REFRESH_TOKEN", "만료된 Refresh Token입니다."),

    EMAIL_VERIFICATION_NOT_FOUND(HttpStatus.NOT_FOUND, "EMAIL_VERIFICATION_NOT_FOUND", "이메일 인증 정보를 찾을 수 없습니다."),
    EMAIL_NOT_VERIFIED(HttpStatus.BAD_REQUEST, "EMAIL_NOT_VERIFIED", "이메일 인증이 완료되지 않았습니다."),
    INVALID_VERIFICATION_CODE(HttpStatus.BAD_REQUEST, "INVALID_VERIFICATION_CODE", "인증 코드가 일치하지 않습니다."),
    EXPIRED_VERIFICATION_CODE(HttpStatus.BAD_REQUEST, "EXPIRED_VERIFICATION_CODE", "인증 코드가 만료되었습니다."),
    EMAIL_SEND_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "EMAIL_SEND_FAILED", "이메일 발송에 실패했습니다."),

    PASSWORD_RESET_TOKEN_NOT_FOUND(HttpStatus.NOT_FOUND, "PASSWORD_RESET_TOKEN_NOT_FOUND", "비밀번호 재설정 토큰을 찾을 수 없습니다."),
    INVALID_PASSWORD_RESET_TOKEN(HttpStatus.BAD_REQUEST, "INVALID_PASSWORD_RESET_TOKEN", "유효하지 않은 비밀번호 재설정 토큰입니다."),
    EXPIRED_PASSWORD_RESET_TOKEN(HttpStatus.BAD_REQUEST, "EXPIRED_PASSWORD_RESET_TOKEN", "비밀번호 재설정 토큰이 만료되었습니다."),

    GROUP_NOT_FOUND(HttpStatus.NOT_FOUND, "GROUP_NOT_FOUND", "모임을 찾을 수 없습니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;

    ErrorCode(HttpStatus httpStatus, String code, String message) {
        this.httpStatus = httpStatus;
        this.code = code;
        this.message = message;
    }
}
