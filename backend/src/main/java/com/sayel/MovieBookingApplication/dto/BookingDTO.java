package com.sayel.MovieBookingApplication.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class BookingDTO {
    @NotEmpty(message = "Select at least one seat")
    private List<String> seatNumbers;

    @NotNull(message = "showId is required")
    private Long showId;
}
