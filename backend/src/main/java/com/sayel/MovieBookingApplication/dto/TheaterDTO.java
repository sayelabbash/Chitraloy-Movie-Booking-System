package com.sayel.MovieBookingApplication.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TheaterDTO {

    @NotBlank(message = "Theater name is required")
    @Size(max = 150, message = "Theater name cannot exceed 150 characters")
    private String theaterName;

    @NotBlank(message = "Theater location is required")
    @Size(max = 255, message = "Theater location cannot exceed 255 characters")
    private String theaterLocation;

    @NotNull(message = "Theater capacity is required")
    @Positive(message = "Theater capacity must be greater than 0")
    private Integer theaterCapacity;

    @NotBlank(message = "Screen type is required")
    private String theaterScreenType;
}
