package com.sayel.MovieBookingApplication.exception;


public class BookingAccessDeniedException extends RuntimeException {

    public BookingAccessDeniedException(String message) {
        super(message);
    }
}
