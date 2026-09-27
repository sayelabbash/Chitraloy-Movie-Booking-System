package com.sayel.MovieBookingApplication.service;

import com.sayel.MovieBookingApplication.exception.ResourceNotFoundException;
import com.sayel.MovieBookingApplication.model.Seat;
import com.sayel.MovieBookingApplication.model.SeatStatus;
import com.sayel.MovieBookingApplication.model.Show;
import com.sayel.MovieBookingApplication.repository.SeatRepository;
import com.sayel.MovieBookingApplication.repository.ShowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SeatServiceImpl implements SeatService {

    private final SeatRepository seatRepository;
    private final ShowRepository showRepository;

    private static final int SEATS_PER_ROW = 10;
    @Override
    public List<Seat> createSeats(Long showId) {
        Show show = showRepository.findById(showId)
                .orElseThrow(() -> new ResourceNotFoundException("No show found for id " + showId));
        List<Seat> existing = seatRepository.findByShow_Id(showId);
        if (!existing.isEmpty()) {
            throw new RuntimeException("Seats have already been set up for this show");
        }

        int capacity = show.getTheater().getTheaterCapacity() != null
                ? show.getTheater().getTheaterCapacity()
                : 100;

        List<Seat> seats = new ArrayList<>();
        int remaining = capacity;
        int rowIndex = 0;

        while (remaining > 0) {
            char rowLetter = (char) ('A' + rowIndex);
            int seatsInThisRow = Math.min(SEATS_PER_ROW, remaining);
            for (int seatNum = 1; seatNum <= seatsInThisRow; seatNum++) {
                seats.add(Seat.builder()
                        .seatNumber("" + rowLetter + seatNum)
                        .status(SeatStatus.AVAILABLE)
                        .show(show)
                        .build());
            }
            remaining -= seatsInThisRow;
            rowIndex++;
        }

        return seatRepository.saveAll(seats);
    }
    @Override
    public List<Seat> getSeatsForShow(Long showId) {
        if (!showRepository.existsById(showId)) {
            throw new ResourceNotFoundException("No show found for id " + showId);
        }
        return seatRepository.findByShow_Id(showId);
    }
}
