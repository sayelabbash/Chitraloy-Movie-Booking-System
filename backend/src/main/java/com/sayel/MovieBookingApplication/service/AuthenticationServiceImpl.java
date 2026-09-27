package com.sayel.MovieBookingApplication.service;

import com.sayel.MovieBookingApplication.dto.LoginRequestDTO;
import com.sayel.MovieBookingApplication.dto.LoginResponseDTO;
import com.sayel.MovieBookingApplication.dto.RegisterRequestDTO;
import com.sayel.MovieBookingApplication.dto.UserResponseDTO;
import com.sayel.MovieBookingApplication.exception.DuplicateUserException;
import com.sayel.MovieBookingApplication.exception.ResourceNotFoundException;
import com.sayel.MovieBookingApplication.jwt.JwtService;
import com.sayel.MovieBookingApplication.model.User;
import com.sayel.MovieBookingApplication.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class AuthenticationServiceImpl implements AuthenticationService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JwtService jwtService;
    @Override
    public UserResponseDTO registerNormalUser(RegisterRequestDTO registerRequestDTO){
        if (userRepository.existsByUsername(registerRequestDTO.getUsername())) {
            throw new DuplicateUserException(
                    "Username already registered"
            );
        }

        if (userRepository.existsByEmail(registerRequestDTO.getEmail())) {
            throw new DuplicateUserException(
                    "Email already registered"
            );
        }


        Set<String> roles = new HashSet<String>();
        roles.add("USER");

        User user = new User();
        user.setUsername(registerRequestDTO.getUsername());
        user.setEmail(registerRequestDTO.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequestDTO.getPassword()));
        user.setRoles(roles);
        User savedUser = userRepository.save(user);

        return new UserResponseDTO(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getRoles()
        );

    }
    @Override
    public UserResponseDTO registerAdminUser(RegisterRequestDTO registerRequestDTO){
        if (userRepository.existsByUsername(registerRequestDTO.getUsername())){
            throw new DuplicateUserException(
                    "Username already registered"
            );
        }

        if (userRepository.existsByEmail(registerRequestDTO.getEmail())) {
            throw new DuplicateUserException(
                    "Email already registered"
            );
        }

        Set<String> roles = new HashSet<String>();
        roles.add("ADMIN");
        roles.add("USER");

        User user = new User();
        user.setUsername(registerRequestDTO.getUsername());
        user.setEmail(registerRequestDTO.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequestDTO.getPassword()));
        user.setRoles(roles);
        User savedUser = userRepository.save(user);

        return new UserResponseDTO(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getRoles()
        );
    }
    @Override
    public LoginResponseDTO login(LoginRequestDTO loginRequestDTO){
        User user = userRepository.findByUsername(loginRequestDTO.getUsername())
                .orElseThrow(()->new ResourceNotFoundException("User not found"));
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequestDTO.getUsername(),
                        loginRequestDTO.getPassword()
                )
        );
        String token = jwtService.generateToken(user);
        return LoginResponseDTO.builder()
                               .jwtToken(token)
                               .username(user.getUsername())
                               .roles(user.getRoles())
                               .build();
    }
}
