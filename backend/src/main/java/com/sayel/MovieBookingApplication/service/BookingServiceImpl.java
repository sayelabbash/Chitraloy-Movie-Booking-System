package com.sayel.MovieBookingApplication.service;

import com.sayel.MovieBookingApplication.config.BookingLimitsProperties;
import com.sayel.MovieBookingApplication.dto.BookingDTO;
import com.sayel.MovieBookingApplication.exception.BookingAccessDeniedException;
import com.sayel.MovieBookingApplication.exception.BookingLimitExceededException;
import com.sayel.MovieBookingApplication.exception.ResourceNotFoundException;
import com.sayel.MovieBookingApplication.exception.TooManyBookingAttemptsException;
import com.sayel.MovieBookingApplication.model.*;
import com.sayel.MovieBookingApplication.repository.BookingAttemptRepository;
import com.sayel.MovieBookingApplication.repository.BookingRepository;
import com.sayel.MovieBookingApplication.repository.SeatRepository;
import com.sayel.MovieBookingApplication.repository.ShowRepository;
import com.sayel.MovieBookingApplication.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class BookingServiceImpl implements BookingService {
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private ShowRepository showRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private SeatRepository seatRepository;
    @Autowired
    private BookingAttemptRepository bookingAttemptRepository;
    @Autowired
    private BookingLimitsProperties bookingLimits;
    @Override
    @Transactional
    public Booking createBooking(BookingDTO dto) {

        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(()->new ResourceNotFoundException("User Not Found"));

        enforceAttemptRateLimit(user);
        recordAttempt(user);

        enforceMaxSeatsPerBooking(dto);
        enforceActivePendingBookingLimit(user);

        validateDuplicateSeats(dto.getSeatNumbers());
        Show show = showRepository.findById(dto.getShowId())
                .orElseThrow(() -> new ResourceNotFoundException("Show not found"));

        List<Seat> seats = seatRepository
                .findSeatsForUpdate(
                        dto.getShowId(),
                        dto.getSeatNumbers()
                );

        if (seats.size() != dto.getSeatNumbers().size()) {
            throw new ResourceNotFoundException("Some seats not found");
        }

        for (Seat seat : seats) {
            if (seat.getStatus() != SeatStatus.AVAILABLE) {
                throw new RuntimeException(
                        "Seat " + seat.getSeatNumber() + " is not available"
                );
            }
        }


        Booking booking = new Booking();
        booking.setUser(user);
        booking.setShow(show);
        booking.setBookingTime(LocalDateTime.now());
        booking.setBookingStatus(BookingStatus.PENDING);
        booking.setNumberOfSeats(seats.size());
        booking.setPrice(show.getPrice().multiply(BigDecimal.valueOf(seats.size())));

        booking.setSeatNumbers(dto.getSeatNumbers());

        Booking savedBooking = bookingRepository.save(booking);

        for (Seat seat : seats) {
            seat.setStatus(SeatStatus.LOCKED);
            seat.setBooking(savedBooking);
        }
        seatRepository.saveAll(seats);

        return savedBooking;
    }


    private void enforceAttemptRateLimit(User user) {
        LocalDateTime windowStart = LocalDateTime.now().minusMinutes(bookingLimits.getAttemptWindowMinutes());
        long recentAttempts = bookingAttemptRepository.countByUserIdAndAttemptTimeAfter(user.getId(), windowStart);
        if (recentAttempts >= bookingLimits.getMaxAttempts()) {
            throw new TooManyBookingAttemptsException(
                    "Too many booking attempts. You can try again in "
                            + bookingLimits.getAttemptWindowMinutes() + " minutes."
            );
        }
    }

    private void recordAttempt(User user) {
        bookingAttemptRepository.save(
                BookingAttempt.builder()
                        .user(user)
                        .attemptTime(LocalDateTime.now())
                        .build()
        );
    }

    private void enforceMaxSeatsPerBooking(BookingDTO dto) {
        int requested = dto.getSeatNumbers() == null ? 0 : dto.getSeatNumbers().size();
        if (requested == 0) {
            throw new BookingLimitExceededException("Select at least one seat");
        }
        if (requested > bookingLimits.getMaxSeatsPerBooking()) {
            throw new BookingLimitExceededException(
                    "You can book at most " + bookingLimits.getMaxSeatsPerBooking() + " seats per booking"
            );
        }
    }

    private void enforceActivePendingBookingLimit(User user) {
        long activePending = bookingRepository.countByUserIdAndBookingStatus(user.getId(), BookingStatus.PENDING);
        if (activePending >= bookingLimits.getMaxActivePendingBookings()) {
            throw new BookingLimitExceededException(
                    "You already have a pending booking awaiting payment. "
                            + "Complete or wait for it to expire before starting a new one."
            );
        }
    }

    private void validateDuplicateSeats(List<String> seatNumbers) {
        if (seatNumbers == null || seatNumbers.isEmpty()) {
            throw new BookingLimitExceededException(
                    "Select at least one seat"
            );
        }
        Set<String> unique = new HashSet<>(seatNumbers);

        if (unique.size() != seatNumbers.size()) {
            throw new RuntimeException("Duplicate seat numbers found");
        }
    }
    @Override
    public List<Booking> getUserBookings(Long userId){
        return bookingRepository.findByUserId(userId);
    }
    @Override
    public List<Booking> getShowBookings(Long showId){
        return bookingRepository.findByShowId(showId);
    }
    @Override
    @Transactional
    public Booking cancelBooking(Long bookingId) {
        Booking booking =
                bookingRepository.findBookingForUpdate(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        boolean isOwner = booking.getUser().getUsername().equals(username);
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                .stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isOwner && !isAdmin) {
            throw new BookingAccessDeniedException(
                    "You can only cancel your own bookings"
            );
        }

        validateCancellation(booking);

        booking.setBookingStatus(BookingStatus.CANCELLED);
        List<Seat> seats = seatRepository.findByBookingId(bookingId);
        for (Seat seat : seats) {
            seat.setStatus(SeatStatus.AVAILABLE);
            seat.setBooking(null);
        }
        seatRepository.saveAll(seats);
        return bookingRepository.save(booking);
    }
    private void validateCancellation(Booking booking){
        if (booking.getBookingStatus() != BookingStatus.PENDING) {
            throw new RuntimeException(
                    "Only pending bookings can be cancelled"
            );
        }
        LocalDateTime showTime = booking.getShow().getShowTime();
        LocalDateTime deadlineTime = showTime.minusHours(2);
        if (!LocalDateTime.now().isBefore(deadlineTime)) {
            throw new RuntimeException(
                    "Cannot cancel the booking within 2 hours of the show"
            );
        }
    }
    @Override
    public List<Booking> getMyBookings() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User Not Found"));
        return bookingRepository.findByUserId(user.getId());
    }
    @Override
    public List<Booking> getBookingsByStatus(BookingStatus bookingStatus){
        return bookingRepository.findByBookingStatus(bookingStatus);
    }



}
