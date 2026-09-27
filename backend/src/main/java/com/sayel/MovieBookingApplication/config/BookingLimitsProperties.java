package com.sayel.MovieBookingApplication.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;


@Component
@ConfigurationProperties(prefix = "booking.limits")
@Data
public class BookingLimitsProperties {

    private int maxSeatsPerBooking;
    private int maxAttempts;
    private int attemptWindowMinutes;
    private int seatHoldMinutes;
    private int maxActivePendingBookings;
}
