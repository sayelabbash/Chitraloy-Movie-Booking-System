package com.sayel.MovieBookingApplication.repository;

import com.sayel.MovieBookingApplication.model.Show;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShowRepository extends JpaRepository<Show,Long> {
    List<Show> findByMovieId(Long movieId);

    List<Show> findByTheaterId(Long theaterId);
}
