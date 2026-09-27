package com.sayel.MovieBookingApplication.repository;

import com.sayel.MovieBookingApplication.model.Booking;
import com.sayel.MovieBookingApplication.model.BookingStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking,Long> {
    List<Booking> findByUserId(Long userId);
    List<Booking> findByShowId(Long showId);
    List<Booking> findByBookingStatus(BookingStatus bookingStatus);
    List<Booking> findByBookingStatusAndBookingTimeBefore(
            BookingStatus status,
            LocalDateTime time
    );
    long countByUserIdAndBookingStatus(Long userId, BookingStatus bookingStatus);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
    SELECT b
    FROM Booking b
    WHERE b.id = :bookingId
    """)
    Optional<Booking> findBookingForUpdate(
            @Param("bookingId") Long bookingId
    );
}
