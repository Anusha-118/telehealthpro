package com.telehealth.pro.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {
    private boolean success;
    private String message;
    private Tokens tokens;
    private UserDetails user;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Tokens {
        private String accessToken;
        private String refreshToken;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class UserDetails {
        private Long id;
        private String name;
        private String email;
        private String role;
        private Long profileId;
        private String doctorVerificationStatus;
    }
}
