package com.sayel.MovieBookingApplication.service;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.sayel.MovieBookingApplication.dto.PaymentResponse;
import com.sayel.MovieBookingApplication.dto.PaymentVerifyRequest;
import com.sayel.MovieBookingApplication.exception.BookingAccessDeniedException;
import com.sayel.MovieBookingApplication.exception.ResourceNotFoundException;
import com.sayel.MovieBookingApplication.model.*;
import com.sayel.MovieBookingApplication.repository.BookingRepository;
import com.sayel.MovieBookingApplication.repository.PaymentRepository;
import com.sayel.MovieBookingApplication.repository.SeatRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    @Value("${razorpay.key}")
    private String key;

    @Value("${razorpay.secret}")
    private String secret;

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final SeatRepository seatRepository;
    private final EmailService emailService;
    @Override
    public PaymentResponse createPaymentOrder(Long bookingId) throws RazorpayException {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        validateBookingOwnership(booking);
        if (booking.getBookingStatus() != BookingStatus.PENDING) {
            throw new RuntimeException(
                    "Payment can only be created for a pending booking"
            );
        }
        LocalDateTime expiryTime =
                booking.getBookingTime()
                        .plusMinutes(5);

        if (LocalDateTime.now().isAfter(expiryTime)) {
            throw new RuntimeException(
                    "Booking hold has expired. Please select the seats again."
            );
        }
        Optional<Payment> existingPayment = paymentRepository.findByBookingId(bookingId);

        if (existingPayment.isPresent()) {
            Payment payment1 = existingPayment.get();
            if (payment1.getStatus() == PaymentStatus.SUCCESS) {
                throw new RuntimeException("Payment has already been completed for this booking");
            }
            if (payment1.getStatus() == PaymentStatus.PENDING) {
                return new PaymentResponse(
                        payment1.getRazorpayOrderId(),
                        payment1.getAmount().multiply(BigDecimal.valueOf(100)).longValueExact()
                );
            }
        }
        RazorpayClient client = new RazorpayClient(key, secret);

        long amountInPaise = booking.getPrice().multiply(BigDecimal.valueOf(100)).longValueExact();

        JSONObject options = new JSONObject();
        options.put("amount", amountInPaise); // paise, must be an integer for Razorpay
        options.put("currency", "INR");
        options.put("receipt", "booking_" + bookingId);

        com.razorpay.Order razorpayOrder = client.orders.create(options);

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setRazorpayOrderId(razorpayOrder.get("id"));
        payment.setStatus(PaymentStatus.PENDING);
        payment.setAmount(booking.getPrice());

        paymentRepository.save(payment);

        long razorpayAmount =
                ((Number) razorpayOrder.get("amount")).longValue();

        return new PaymentResponse(
                razorpayOrder.get("id"),
                razorpayAmount
        );
    }
    @Override
    @Transactional
    public String verifyPayment(Long bookingId, PaymentVerifyRequest request)
            throws RazorpayException {

        Booking booking = bookingRepository.findBookingForUpdate(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking not found"));
        validateBookingOwnership(booking);
        Payment payment = paymentRepository
                .findByRazorpayOrderId(request.getRazorpay_order_id())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Payment not found"));

        if (!payment.getBooking().getId().equals(bookingId)) {
            throw new RuntimeException(
                    "Payment does not belong to this booking"
            );
        }
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return "Payment already processed";
        }

        if (booking.getBookingStatus() != BookingStatus.PENDING) {
            throw new RuntimeException(
                    "Booking is no longer available for payment"
            );
        }
        LocalDateTime expiryTime =
                booking.getBookingTime().plusMinutes(5);

        if (LocalDateTime.now().isAfter(expiryTime)) {
            throw new RuntimeException(
                    "Booking hold has expired. Please select the seats again."
            );
        }

        String razorpayOrderId = request.getRazorpay_order_id();
        String paymentId = request.getRazorpay_payment_id();
        String signature = request.getRazorpay_signature();

        boolean isValid = verifySignature(razorpayOrderId, paymentId, signature);


        if (!isValid) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);

            releaseSeats(booking);

            booking.setBookingStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking);

            return "Payment failed. Invalid payment signature.";
        }

        payment.setRazorpayPaymentId(paymentId);
        payment.setStatus(PaymentStatus.SUCCESS);
        paymentRepository.save(payment);

        booking.setBookingStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        List<Seat> seats = seatRepository.findByBookingId(bookingId);
        for (Seat seat : seats) {
            seat.setStatus(SeatStatus.BOOKED);
        }
        seatRepository.saveAll(seats);

        try {
            emailService.sendEmail(
                    booking.getUser().getEmail(),
                    "Booking Confirmed ",
                    "Your booking is confirmed. Seats: " + booking.getSeatNumbers()
            );
        } catch (Exception e) {
            System.out.println("Email failed");
        }

        return "Payment successful. Booking confirmed. Payment ID: " + paymentId;
    }

    private boolean verifySignature(String orderId, String paymentId, String signature)
            throws RazorpayException {

        String data = orderId + "|" + paymentId;
        return Utils.verifySignature(data, signature, secret);
    }


    private void releaseSeats(Booking booking) {
        List<Seat> seats = seatRepository.findByBookingId(booking.getId());

        for (Seat seat : seats) {
            seat.setStatus(SeatStatus.AVAILABLE);
            seat.setBooking(null);
        }
        seatRepository.saveAll(seats);
    }
    private void validateBookingOwnership(Booking booking) {

        String username = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        boolean isOwner =
                booking.getUser()
                        .getUsername()
                        .equals(username);

        boolean isAdmin =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getAuthorities()
                        .stream()
                        .anyMatch(auth ->
                                auth.getAuthority().equals("ROLE_ADMIN"));

        if (!isOwner && !isAdmin) {
            throw new BookingAccessDeniedException(
                    "You can only make payment for your own booking"
            );
        }
    }
}