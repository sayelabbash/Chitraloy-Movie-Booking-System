package com.sayel.MovieBookingApplication.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
    @Data
    public class ShowDTO {

        @NotNull(message = "Show time is required")
        @Future(message = "Show time must be in the future")
        private LocalDateTime showTime;

        @NotNull(message = "Price is required")
        @Positive(message = "Price must be greater than 0")
        private BigDecimal price;

        @NotNull(message = "Movie ID is required")
        @Positive(message = "Movie ID must be positive")
        private Long movieId;

        @NotNull(message = "Theater ID is required")
        @Positive(message = "Theater ID must be positive")
        private Long theaterId;
    }
