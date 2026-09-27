package com.sayel.MovieBookingApplication.service;

import com.razorpay.RazorpayException;
import com.sayel.MovieBookingApplication.dto.PaymentResponse;
import com.sayel.MovieBookingApplication.dto.PaymentVerifyRequest;

public interface PaymentService {

    PaymentResponse createPaymentOrder(Long bookingId)
            throws RazorpayException;

    String verifyPayment(
            Long bookingId,
            PaymentVerifyRequest request
    ) throws RazorpayException;

}
