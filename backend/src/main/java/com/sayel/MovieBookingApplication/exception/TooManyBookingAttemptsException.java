package com.sayel.MovieBookingApplication.exception;

public class TooManyBookingAttemptsException extends RuntimeException {
    public TooManyBookingAttemptsException(String message) {
        super(message);
    }
}
