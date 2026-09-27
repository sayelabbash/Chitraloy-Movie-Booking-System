package com.sayel.MovieBookingApplication.controller;

import com.sayel.MovieBookingApplication.dto.RegisterRequestDTO;
import com.sayel.MovieBookingApplication.dto.UserResponseDTO;
import com.sayel.MovieBookingApplication.service.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AuthenticationService authenticationService;

    @PostMapping("/registeradminuser")
    public ResponseEntity<UserResponseDTO> registerAdminUser(@RequestBody RegisterRequestDTO registerRequestDTO){
        return ResponseEntity.ok(
                authenticationService.registerAdminUser(registerRequestDTO)
        );
    }
}
