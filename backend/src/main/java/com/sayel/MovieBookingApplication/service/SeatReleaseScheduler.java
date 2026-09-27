package com.sayel.MovieBookingApplication.service;

import com.sayel.MovieBookingApplication.config.BookingLimitsProperties;
import com.sayel.MovieBookingApplication.model.Booking;
import com.sayel.MovieBookingApplication.model.BookingStatus;
import com.sayel.MovieBookingApplication.model.Seat;
import com.sayel.MovieBookingApplication.model.SeatStatus;
import com.sayel.MovieBookingApplication.repository.BookingAttemptRepository;
import com.sayel.MovieBookingApplication.repository.BookingRepository;
import com.sayel.MovieBookingApplication.repository.SeatRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SeatReleaseScheduler {

    private final BookingRepository bookingRepository;
    private final SeatRepository seatRepository;
    private final BookingAttemptRepository bookingAttemptRepository;
    private final BookingLimitsProperties bookingLimits;

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void releaseExpiredBookings() {

        LocalDateTime expiryTime = LocalDateTime.now().minusMinutes(bookingLimits.getSeatHoldMinutes());

        List<Booking> expiredBookings =
                bookingRepository.findByBookingStatusAndBookingTimeBefore(
                        BookingStatus.PENDING, expiryTime
                );

        for (Booking booking : expiredBookings) {

            List<Seat> seats = seatRepository.findByBookingId(booking.getId());

            for (Seat seat : seats) {
                seat.setStatus(SeatStatus.AVAILABLE);
                seat.setBooking(null);
            }
            seatRepository.saveAll(seats);
            booking.setBookingStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking);
        }
    }

    @Scheduled(fixedRate = 900000)
    @Transactional
    public void cleanupOldBookingAttempts() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(bookingLimits.getAttemptWindowMinutes());
        bookingAttemptRepository.deleteOlderThan(cutoff);
    }
}