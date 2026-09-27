package com.sayel.MovieBookingApplication.repository;

import com.sayel.MovieBookingApplication.model.Theater;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TheaterRepository extends JpaRepository<Theater, Long> {
    List<Theater> findByTheaterLocation(String location);
}
