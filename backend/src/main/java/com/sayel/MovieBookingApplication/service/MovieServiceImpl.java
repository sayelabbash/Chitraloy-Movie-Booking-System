package com.sayel.MovieBookingApplication.service;

import com.sayel.MovieBookingApplication.dto.MovieDTO;
import com.sayel.MovieBookingApplication.exception.ResourceNotFoundException;
import com.sayel.MovieBookingApplication.model.Movie;
import com.sayel.MovieBookingApplication.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MovieServiceImpl implements MovieService {
    @Autowired
    private MovieRepository movieRepository;
    @Override
    public Movie addMovie(MovieDTO movieDTO){
        Movie movie = new Movie();
        movie.setName(movieDTO.getName());
        movie.setDescription(movieDTO.getDescription());
        movie.setGenre(movieDTO.getGenre());
        movie.setReleaseDate(movieDTO.getReleaseDate());
        movie.setDuration(movieDTO.getDuration());
        movie.setLanguage(movieDTO.getLanguage());
        movie.setPosterUrl(movieDTO.getPosterUrl());

        return movieRepository.save(movie);
    }
    @Override
    public Page<Movie> getAllMovies(int page, int size){
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("releaseDate").descending()
        );
        return movieRepository.findAll(pageable);
    }
    @Override
    public Page<Movie> getMovieByGenre(String genre, int page, int size) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("releaseDate").descending()
        );

        Page<Movie> movies =
                movieRepository.findByGenreContainingIgnoreCase(genre, pageable);

        if (movies.isEmpty()) {
            throw new ResourceNotFoundException(
                    "No movies found for genre " + genre
            );
        }

        return movies;
    }

    @Override
    public Page<Movie> getMovieByLanguage(String language, int page, int size
    ) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("releaseDate").descending()
        );

        Page<Movie> movies =
                movieRepository.findByLanguageContainingIgnoreCase(
                        language,
                        pageable
                );

        if (movies.isEmpty()) {
            throw new ResourceNotFoundException(
                    "No movies found for language " + language
            );
        }

        return movies;
    }

    @Override
    public Page<Movie> getMovieByTitle(String title, int page, int size) {

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("releaseDate").descending()
        );

        Page<Movie> movies =
                movieRepository.findByNameContainingIgnoreCase(title, pageable);

        if (movies.isEmpty()) {
            throw new ResourceNotFoundException(
                    "No movies found for the title " + title
            );
        }

        return movies;
    }
    @Override
    public Movie updateMovie(Long id, MovieDTO movieDTO){
        Movie movie = movieRepository.findById(id)
                .orElseThrow(()->new ResourceNotFoundException("No Movie Found for the id "+id));
        movie.setName(movieDTO.getName());
        movie.setDescription(movieDTO.getDescription());
        movie.setGenre(movieDTO.getGenre());
        movie.setReleaseDate(movieDTO.getReleaseDate());
        movie.setDuration(movieDTO.getDuration());
        movie.setLanguage(movieDTO.getLanguage());
        movie.setPosterUrl(movieDTO.getPosterUrl());

        return movieRepository.save(movie);
    }
    @Override
    public void deleteMovie(Long id) {

        Movie movie = movieRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No movie found for id " + id
                        )
                );

        movieRepository.delete(movie);
    }
}

