package com.sayel.MovieBookingApplication.controller;

import com.sayel.MovieBookingApplication.model.Seat;
import com.sayel.MovieBookingApplication.repository.SeatRepository;
import com.sayel.MovieBookingApplication.service.SeatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
public class SeatController {

    private final SeatService seatService;

    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Seat>> createSeats(@RequestParam Long showId) {
        return ResponseEntity.ok(seatService.createSeats(showId));
    }

    @GetMapping("/show/{showId}")
    public ResponseEntity<List<Seat>> getSeatsForShow(@PathVariable Long showId) {
        return ResponseEntity.ok(seatService.getSeatsForShow(showId));
    }
}
