package com.sayel.MovieBookingApplication.repository;

import com.sayel.MovieBookingApplication.model.Movie;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MovieRepository extends JpaRepository<Movie,Long> {
    Page<Movie> findByNameContainingIgnoreCase(
            String name,
            Pageable pageable
    );

    Page<Movie> findByGenreContainingIgnoreCase(
            String genre,
            Pageable pageable
    );

    Page<Movie> findByLanguageContainingIgnoreCase(
            String language,
            Pageable pageable
    );
}
