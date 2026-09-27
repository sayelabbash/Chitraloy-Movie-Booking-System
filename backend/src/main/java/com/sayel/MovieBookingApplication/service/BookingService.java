package com.sayel.MovieBookingApplication.service;

import com.sayel.MovieBookingApplication.dto.BookingDTO;
import com.sayel.MovieBookingApplication.model.Booking;
import com.sayel.MovieBookingApplication.model.BookingStatus;

import java.util.List;

public interface BookingService {

    Booking createBooking(BookingDTO dto);

    List<Booking> getUserBookings(Long userId);

    List<Booking> getShowBookings(Long showId);

    Booking cancelBooking(Long bookingId);

    List<Booking> getMyBookings();

    List<Booking> getBookingsByStatus(BookingStatus bookingStatus);
}