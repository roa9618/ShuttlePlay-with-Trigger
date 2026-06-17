package com.shuttleplay.server.domain.user.service;

import com.shuttleplay.server.global.error.BusinessException;
import com.shuttleplay.server.global.error.ErrorCode;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Service
public class UserImageService {
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );
    private final Path uploadDirectory = Path.of("uploads", "users").toAbsolutePath().normalize();

    public String upload(MultipartFile image) {
        validate(image);

        try {
            Files.createDirectories(uploadDirectory);
            String extension = getExtension(image.getContentType());
            String fileName = UUID.randomUUID() + extension;
            Files.copy(
                    image.getInputStream(),
                    uploadDirectory.resolve(fileName),
                    StandardCopyOption.REPLACE_EXISTING
            );

            return ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/uploads/users/")
                    .path(fileName)
                    .toUriString();
        } catch (IOException exception) {
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "이미지 저장에 실패했습니다.");
        }
    }

    private void validate(MultipartFile image) {
        if (image.isEmpty()
                || image.getSize() > MAX_FILE_SIZE
                || !ALLOWED_CONTENT_TYPES.contains(image.getContentType())) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "JPG, PNG, WEBP 이미지만 업로드할 수 있습니다.");
        }
    }

    private String getExtension(String contentType) {
        return switch (contentType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };
    }
}
