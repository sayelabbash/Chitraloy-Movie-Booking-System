package com.sayel.MovieBookingApplication.repository;

import com.sayel.MovieBookingApplication.model.Seat;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByShow_IdAndSeatNumberIn(Long showId, List<String> seatNumbers);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT s
        FROM Seat s
        WHERE s.show.id = :showId
        AND s.seatNumber IN :seatNumbers
    """)
    List<Seat> findSeatsForUpdate(
            @Param("showId") Long showId,
            @Param("seatNumbers") List<String> seatNumbers
    );
    List<Seat> findByBookingId(Long bookingId);
    List<Seat> findByShow_Id(Long showId);
    void deleteByShow_Id(Long showId);
}
