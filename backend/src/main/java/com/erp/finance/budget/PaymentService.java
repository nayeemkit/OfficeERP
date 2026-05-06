package com.erp.finance.budget;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;

import java.util.Map;
@Service
public class PaymentService {

    @Value("${sslcommerz.store.id}")
    private String storeId;

    @Value("${sslcommerz.store.password}")
    private String storePassword;

    @Value("${sslcommerz.url.initiate}")
    private String initiateUrl;

    @Value("${app.payment.success-url}")
    private String successUrl;

    @Value("${app.payment.fail-url}")
    private String failUrl;

    @Value("${app.payment.cancel-url}")
    private String cancelUrl;

    private final RestClient restClient;

    public PaymentService(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.build();
    }

    public String initiatePayment(double amount, String transactionId) {
        System.out.println("DEBUG: Success URL being sent to SSL: " + successUrl);

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();

        map.add("store_id", storeId);
        map.add("store_passwd", storePassword);
        map.add("total_amount", String.valueOf(amount));
        map.add("currency", "BDT");
        map.add("tran_id", transactionId);

        map.add("success_url", successUrl);
        map.add("fail_url", failUrl);
        map.add("cancel_url", cancelUrl);

        map.add("cus_name", "Customer Name");
        map.add("cus_email", "cust@mail.com");
        map.add("cus_phone", "01700000000");
        map.add("cus_add1", "Dhaka");
        map.add("cus_city", "Dhaka");
        map.add("cus_country", "Bangladesh");

        map.add("shipping_method", "NO");
        map.add("product_name", "Test Product");
        map.add("product_category", "General");
        map.add("product_profile", "general");

        Map<String, Object> response = restClient.post()
                .uri(initiateUrl)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(map)
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {});

        if (response != null && "SUCCESS".equals(response.get("status"))) {
            return (String) response.get("GatewayPageURL");
        }

        String failedReason = response != null
                ? String.valueOf(response.get("failedreason"))
                : "No response from SSLCommerz";

        throw new RuntimeException("Payment Initiation Failed: " + failedReason);
    }
}