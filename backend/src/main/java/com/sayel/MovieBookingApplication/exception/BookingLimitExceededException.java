package com.sayel.MovieBookingApplication.exception;

public class BookingLimitExceededException extends RuntimeException {
    public BookingLimitExceededException(String message) {
        super(message);
    }
}
