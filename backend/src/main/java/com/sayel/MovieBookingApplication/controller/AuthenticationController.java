package com.sayel.MovieBookingApplication.controller;

import com.sayel.MovieBookingApplication.dto.LoginRequestDTO;
import com.sayel.MovieBookingApplication.dto.LoginResponseDTO;
import com.sayel.MovieBookingApplication.dto.RegisterRequestDTO;
import com.sayel.MovieBookingApplication.dto.UserResponseDTO;
import com.sayel.MovieBookingApplication.exception.ResourceNotFoundException;
import com.sayel.MovieBookingApplication.model.User;
import com.sayel.MovieBookingApplication.repository.UserRepository;
import com.sayel.MovieBookingApplication.service.AuthenticationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthenticationController {
    @Autowired
    private AuthenticationService authenticationService;
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/registernormaluser")
    public ResponseEntity<UserResponseDTO> registerNormalUser(@RequestBody @Valid RegisterRequestDTO registerRequestDTO){
        return ResponseEntity.ok(authenticationService.registerNormalUser(registerRequestDTO));
    }
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody @Valid LoginRequestDTO loginRequestDTO){
        return ResponseEntity.ok(authenticationService.login(loginRequestDTO));
    }
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(user);
    }
}
