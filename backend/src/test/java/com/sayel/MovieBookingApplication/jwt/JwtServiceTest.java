package com.sayel.MovieBookingApplication.jwt;

import com.sayel.MovieBookingApplication.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "SECRET", "test-secret-key-test-secret-key-1234");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 3600000L); // 1 hour
    }

    private User sampleUser(String username) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(username + "@example.com");
        user.setPassword("irrelevant-for-this-test");
        user.setRoles(Set.of("USER"));
        return user;
    }

    @Test
    void generateToken_thenExtractUsername_returnsSameUsername() {
        User user = sampleUser("sayel");

        String token = jwtService.generateToken(user);
        String extractedUsername = jwtService.extractUsername(token);

        assertEquals("sayel", extractedUsername);
    }

    @Test
    void isTokenValid_returnsTrue_forMatchingFreshToken() {
        User user = sampleUser("sayel");
        String token = jwtService.generateToken(user);

        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .builder()
                .username("sayel")
                .password("irrelevant")
                .roles("USER")
                .build();

        assertTrue(jwtService.isTokenValid(token, userDetails));
    }

    @Test
    void isTokenValid_returnsFalse_whenUsernameDoesNotMatch() {
        User user = sampleUser("sayel");
        String token = jwtService.generateToken(user);

        UserDetails otherUser = org.springframework.security.core.userdetails.User
                .builder()
                .username("someone-else")
                .password("irrelevant")
                .roles("USER")
                .build();

        assertFalse(jwtService.isTokenValid(token, otherUser));
    }

    @Test
    void isTokenValid_returnsFalse_forExpiredToken() {
        // expire immediately
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", -1000L);
        User user = sampleUser("sayel");
        String token = jwtService.generateToken(user);

        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .builder()
                .username("sayel")
                .password("irrelevant")
                .roles("USER")
                .build();

        assertFalse(jwtService.isTokenValid(token, userDetails));
    }
}
