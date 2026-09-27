package com.sayel.MovieBookingApplication.controller;

import com.razorpay.RazorpayException;
import com.sayel.MovieBookingApplication.dto.PaymentResponse;
import com.sayel.MovieBookingApplication.dto.PaymentVerifyRequest;
import com.sayel.MovieBookingApplication.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create/{bookingId}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public PaymentResponse createPayment(@PathVariable Long bookingId) throws RazorpayException {
        return paymentService.createPaymentOrder(bookingId);
    }

    @PostMapping("/verify/{bookingId}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public String verifyPayment(@PathVariable Long bookingId,
                                @RequestBody PaymentVerifyRequest request) throws RazorpayException {
        return paymentService.verifyPayment(bookingId, request);
    }
}
