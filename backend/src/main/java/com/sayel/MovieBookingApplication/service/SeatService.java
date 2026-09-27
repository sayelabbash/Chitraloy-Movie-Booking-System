package com.sayel.MovieBookingApplication.service;

import com.sayel.MovieBookingApplication.model.Seat;

import java.util.List;

public interface SeatService {

    List<Seat> createSeats(Long showId);

    List<Seat> getSeatsForShow(Long showId);
}