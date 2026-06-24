package com.telehealth.pro.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryService {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    @Value("${server.port:5000}")
    private String port;

    private Cloudinary cloudinary;
    private boolean useCloudinary;

    @PostConstruct
    public void init() {
        useCloudinary = cloudName != null && !cloudName.isEmpty() && !cloudName.equals("mock_cloudinary_cloud_name");
        if (useCloudinary) {
            cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret
            ));
            System.out.println("[CLOUDINARY] Configured with real credentials.");
        } else {
            System.out.println("Cloudinary credentials missing or default. Local fallback will be used for file uploads.");
        }
    }

    public UploadResult uploadFile(MultipartFile file, String folder) throws IOException {
        if (useCloudinary) {
            try {
                Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                        "folder", folder,
                        "resource_type", "auto"
                ));
                return UploadResult.builder()
                        .url((String) uploadResult.get("secure_url"))
                        .publicId((String) uploadResult.get("public_id"))
                        .build();
            } catch (Exception e) {
                System.err.println("[CLOUDINARY ERROR] Upload failure: " + e.getMessage());
                throw new IOException("Cloudinary upload failed", e);
            }
        } else {
            try {
                String uploadDirPath = "public/uploads";
                File uploadDir = new File(uploadDirPath);
                if (!uploadDir.exists()) {
                    uploadDir.mkdirs();
                }

                String originalFilename = file.getOriginalFilename();
                String ext = "";
                if (originalFilename != null && originalFilename.contains(".")) {
                    ext = originalFilename.substring(originalFilename.lastIndexOf("."));
                }
                String newFilename = UUID.randomUUID().toString() + ext;
                Path destination = Paths.get(uploadDirPath, newFilename);

                Files.write(destination, file.getBytes());

                String fileUrl = "http://localhost:" + port + "/uploads/" + newFilename;
                return UploadResult.builder()
                        .url(fileUrl)
                        .publicId(newFilename)
                        .build();
            } catch (Exception e) {
                System.err.println("[LOCAL UPLOAD ERROR] Fallback upload failure: " + e.getMessage());
                throw new IOException("Local upload fallback failed", e);
            }
        }
    }

    public void deleteFile(String publicId) {
        if (useCloudinary) {
            try {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                System.out.println("[CLOUDINARY] File deleted: " + publicId);
            } catch (Exception e) {
                System.err.println("[CLOUDINARY ERROR] Delete failure: " + e.getMessage());
            }
        } else {
            try {
                Path filePath = Paths.get("public/uploads", publicId);
                Files.deleteIfExists(filePath);
                System.out.println("[LOCAL FILE] Static upload deleted: " + publicId);
            } catch (Exception e) {
                System.err.println("[LOCAL DELETE ERROR] Delete failure: " + e.getMessage());
            }
        }
    }
}
