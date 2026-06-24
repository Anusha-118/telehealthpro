package com.telehealth.pro.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StripeIntentResult {
    private String id;
    private String clientSecret;
    private Long amount;
    private String status;
}
