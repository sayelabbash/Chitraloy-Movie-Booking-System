package com.sayel.MovieBookingApplication.service;

import com.sayel.MovieBookingApplication.dto.TheaterDTO;
import com.sayel.MovieBookingApplication.model.Theater;

import java.util.List;

public interface TheaterService {
    Theater addTheater(TheaterDTO theaterDTO);

    List<Theater> getTheaterByLocation(String location);

    Theater updateTheater(Long id, TheaterDTO theaterDTO);

    void deleteTheater(Long id);

    List<Theater> getAllTheaters();
}
