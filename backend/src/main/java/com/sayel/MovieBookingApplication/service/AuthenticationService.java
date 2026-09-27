package com.sayel.MovieBookingApplication.service;

import com.sayel.MovieBookingApplication.dto.LoginRequestDTO;
import com.sayel.MovieBookingApplication.dto.LoginResponseDTO;
import com.sayel.MovieBookingApplication.dto.RegisterRequestDTO;
import com.sayel.MovieBookingApplication.dto.UserResponseDTO;

public interface AuthenticationService {

    UserResponseDTO registerNormalUser(
            RegisterRequestDTO registerRequestDTO
    );

    UserResponseDTO registerAdminUser(
            RegisterRequestDTO registerRequestDTO
    );

    LoginResponseDTO login(
            LoginRequestDTO loginRequestDTO
    );
}