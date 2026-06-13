package com.shuttleplay.server.domain.group.service;

import com.shuttleplay.server.global.error.BusinessException;
import com.shuttleplay.server.global.error.ErrorCode;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Service
public class GroupPostAttachmentService {
    private static final long MAX_FILE_SIZE = 20 * 1024 * 1024;
    private static final int MAX_FILE_COUNT = 5;
    private final Path uploadDirectory = Path.of("uploads", "group-posts").toAbsolutePath().normalize();

    public List<Map<String, String>> upload(List<MultipartFile> files) {
        if (files == null || files.isEmpty() || files.size() > MAX_FILE_COUNT) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "첨부 파일은 최대 5개까지 등록할 수 있습니다.");
        }
        try {
            Files.createDirectories(uploadDirectory);
            List<Map<String, String>> result = new ArrayList<>();
            for (MultipartFile file : files) {
                validate(file);
                String originalName = Path.of(file.getOriginalFilename() == null ? "attachment" : file.getOriginalFilename()).getFileName().toString();
                String extension = originalName.contains(".") ? originalName.substring(originalName.lastIndexOf('.')) : "";
                String storedName = UUID.randomUUID() + extension;
                Files.copy(file.getInputStream(), uploadDirectory.resolve(storedName), StandardCopyOption.REPLACE_EXISTING);
                String url = ServletUriComponentsBuilder.fromCurrentContextPath().path("/uploads/group-posts/").path(storedName).toUriString();
                result.add(Map.of("name", originalName, "url", url));
            }
            return result;
        } catch (IOException exception) {
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "첨부 파일 저장에 실패했습니다.");
        }
    }

    private void validate(MultipartFile file) {
        if (file.isEmpty() || file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "첨부 파일은 파일당 20MB 이하만 등록할 수 있습니다.");
        }
    }
}
