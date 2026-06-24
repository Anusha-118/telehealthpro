package com.telehealth.pro.service;

import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
public class StripeService {

    @Value("${stripe.api.key}")
    private String stripeSecretKey;

    private boolean isMockStripe;

    @PostConstruct
    public void init() {
        isMockStripe = stripeSecretKey == null || stripeSecretKey.isEmpty() || stripeSecretKey.contains("mockkey");
        if (!isMockStripe) {
            Stripe.apiKey = stripeSecretKey;
            System.out.println("[STRIPE] Initialized with real Stripe secret key.");
        } else {
            System.out.println("Stripe API Key is missing or using a mock token. Payment flows will run in Sandbox Mock mode.");
        }
    }

    public StripeIntentResult createPaymentIntent(long amountInCents, Map<String, String> metadata) {
        if (isMockStripe) {
            String mockId = "pi_mock_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
            String mockSecret = "pi_mock_secret_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
            System.out.println("[MOCK STRIPE] Creating Payment Intent for $" + (amountInCents / 100.0));
            return StripeIntentResult.builder()
                    .id(mockId)
                    .clientSecret(mockSecret)
                    .amount(amountInCents)
                    .status("requires_payment_method")
                    .build();
        } else {
            try {
                PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                        .setAmount(amountInCents)
                        .setCurrency("usd")
                        .putAllMetadata(metadata)
                        .build();
                PaymentIntent intent = PaymentIntent.create(params);
                return StripeIntentResult.builder()
                        .id(intent.getId())
                        .clientSecret(intent.getClientSecret())
                        .amount(intent.getAmount())
                        .status(intent.getStatus())
                        .build();
            } catch (Exception e) {
                System.err.println("[STRIPE ERROR] PaymentIntent creation failure: " + e.getMessage());
                throw new RuntimeException("Stripe error: " + e.getMessage(), e);
            }
        }
    }

    public void refundPayment(String paymentIntentId) {
        if (isMockStripe) {
            System.out.println("[MOCK STRIPE] Refunding Payment Intent: " + paymentIntentId);
            return;
        } else {
            try {
                RefundCreateParams params = RefundCreateParams.builder()
                        .setPaymentIntent(paymentIntentId)
                        .build();
                Refund.create(params);
                System.out.println("[STRIPE] Refund processed successfully: " + paymentIntentId);
            } catch (Exception e) {
                System.err.println("[STRIPE ERROR] Refund failure: " + e.getMessage());
                throw new RuntimeException("Stripe refund error: " + e.getMessage(), e);
            }
        }
    }
}
