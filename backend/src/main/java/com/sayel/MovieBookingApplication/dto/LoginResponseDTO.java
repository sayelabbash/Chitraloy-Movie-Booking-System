package com.sayel.MovieBookingApplication.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Set;

@Data
@Builder
public class LoginResponseDTO {
    private String jwtToken;
    private String username;
    private Set<String> roles;
}
