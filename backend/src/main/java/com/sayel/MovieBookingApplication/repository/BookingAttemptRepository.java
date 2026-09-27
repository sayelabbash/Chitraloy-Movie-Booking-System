package com.sayel.MovieBookingApplication.repository;

import com.sayel.MovieBookingApplication.model.BookingAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;

public interface BookingAttemptRepository extends JpaRepository<BookingAttempt, Long> {

    long countByUserIdAndAttemptTimeAfter(Long userId, LocalDateTime after);

    @Modifying
    @Query("DELETE FROM BookingAttempt b WHERE b.attemptTime < :cutoff")
    void deleteOlderThan(LocalDateTime cutoff);
}
