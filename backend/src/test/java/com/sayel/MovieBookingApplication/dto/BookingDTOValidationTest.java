package com.sayel.MovieBookingApplication.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class BookingDTOValidationTest {

    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void closeFactory() {
        factory.close();
    }

    @Test
    void validBookingDTO_hasNoViolations() {
        BookingDTO dto = new BookingDTO();
        dto.setShowId(1L);
        dto.setSeatNumbers(List.of("A1", "A2"));

        Set<ConstraintViolation<BookingDTO>> violations = validator.validate(dto);

        assertTrue(violations.isEmpty());
    }

    @Test
    void missingShowId_failsValidation() {
        BookingDTO dto = new BookingDTO();
        dto.setSeatNumbers(List.of("A1"));
        dto.setShowId(null);

        Set<ConstraintViolation<BookingDTO>> violations = validator.validate(dto);

        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals("showId")));
    }

    @Test
    void emptySeatNumbers_failsValidation() {
        BookingDTO dto = new BookingDTO();
        dto.setShowId(1L);
        dto.setSeatNumbers(List.of());

        Set<ConstraintViolation<BookingDTO>> violations = validator.validate(dto);

        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals("seatNumbers")));
    }
}
