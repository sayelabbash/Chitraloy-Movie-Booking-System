package com.sayel.MovieBookingApplication.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
@Data
public class MovieDTO {
    private Long id;

    @NotBlank(message = "Movie name is required")
    @Size(max = 150, message = "Movie name cannot exceed 150 characters")
    private String name;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Genre is required")
    private String genre;

    @NotBlank(message = "Language is required")
    private String language;

    @NotNull(message = "Duration is required")
    @Positive(message = "Duration must be greater than 0")
    private Integer duration;

    @NotNull(message = "Release date is required")
    private LocalDate releaseDate;

    @Size(max = 500, message = "Poster URL is too long")
    private String posterUrl;
}
