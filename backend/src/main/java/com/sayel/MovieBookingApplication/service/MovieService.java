package com.sayel.MovieBookingApplication.service;

import com.sayel.MovieBookingApplication.dto.MovieDTO;
import com.sayel.MovieBookingApplication.model.Movie;
import org.springframework.data.domain.Page;

public interface MovieService {

    Movie addMovie(MovieDTO movieDTO);

    Page<Movie> getAllMovies(int page, int size);

    Page<Movie> getMovieByGenre(
            String genre,
            int page,
            int size
    );

    Page<Movie> getMovieByLanguage(
            String language,
            int page,
            int size
    );

    Page<Movie> getMovieByTitle(
            String title,
            int page,
            int size
    );

    Movie updateMovie(
            Long id,
            MovieDTO movieDTO
    );

    void deleteMovie(Long id);
}