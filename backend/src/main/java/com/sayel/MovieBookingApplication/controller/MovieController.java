package com.sayel.MovieBookingApplication.controller;

import com.sayel.MovieBookingApplication.dto.MovieDTO;
import com.sayel.MovieBookingApplication.model.Movie;
import com.sayel.MovieBookingApplication.service.MovieService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
public class MovieController {

    private final MovieService movieService;

    public MovieController(MovieService movieService) {
        this.movieService = movieService;
    }

    @PostMapping("/addMovie")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Movie> addMovie(
            @Valid @RequestBody MovieDTO movieDTO) {

        return ResponseEntity.ok(
                movieService.addMovie(movieDTO)
        );
    }

    @GetMapping("/getallmovies")
    public ResponseEntity<Page<Movie>> getAllMovies( @RequestParam(defaultValue = "0") int page,
                                                     @RequestParam(defaultValue = "10") int size){
        if (page < 0) {
            throw new IllegalArgumentException("Page cannot be negative");
        }

        if (size < 1 || size > 20) {
            throw new IllegalArgumentException(
                    "Page size must be between 1 and 20");
        }
        return ResponseEntity.ok(movieService.getAllMovies(page, size));
    }

    @GetMapping("/getmoviebygenre")
    public ResponseEntity<Page<Movie>> getMovieByGenre(
            @RequestParam String genre,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        return ResponseEntity.ok(
                movieService.getMovieByGenre(genre, page, size)
        );
    }

    @GetMapping("/getmoviebylanguage")
    public ResponseEntity<Page<Movie>> getMovieByLanguage(
            @RequestParam String language,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        return ResponseEntity.ok(
                movieService.getMovieByLanguage(language, page, size)
        );
    }
    @GetMapping("/getmoviebytitle")
    public ResponseEntity<Page<Movie>> getMovieByTitle(
            @RequestParam String title,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        return ResponseEntity.ok(
                movieService.getMovieByTitle(title, page, size)
        );
    }

    @PutMapping("/updateMovie/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Movie> updateMovie(@PathVariable Long id, @RequestBody @Valid MovieDTO movieDTO){
        return ResponseEntity.ok(movieService.updateMovie(id,movieDTO));
    }

    @DeleteMapping("/deletemovie/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMovie(@PathVariable Long id){
        movieService.deleteMovie(id);
        return ResponseEntity.ok().build();
    }
}
