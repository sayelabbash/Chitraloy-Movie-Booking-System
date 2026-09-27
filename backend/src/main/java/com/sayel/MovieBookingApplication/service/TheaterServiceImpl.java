package com.sayel.MovieBookingApplication.service;

import com.sayel.MovieBookingApplication.dto.TheaterDTO;
import com.sayel.MovieBookingApplication.exception.ResourceNotFoundException;
import com.sayel.MovieBookingApplication.model.Theater;
import com.sayel.MovieBookingApplication.repository.TheaterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TheaterServiceImpl implements TheaterService{
    @Autowired
    private TheaterRepository theaterRepository;
    @Override
    public Theater addTheater(TheaterDTO theaterDTO){
        Theater theater = new Theater();
        theater.setTheaterName(theaterDTO.getTheaterName());
        theater.setTheaterLocation(theaterDTO.getTheaterLocation());
        theater.setTheaterCapacity(theaterDTO.getTheaterCapacity());
        theater.setTheaterScreenType(theaterDTO.getTheaterScreenType());

        return theaterRepository.save(theater);
    }
    @Override
    public List<Theater> getTheaterByLocation(String location){
        List<Theater> theaters =
                theaterRepository.findByTheaterLocation(location);

        if (theaters.isEmpty()) {
            throw new ResourceNotFoundException(
                    "No theater found for location " + location
            );
        }

        return theaters;
    }
    @Override
    public Theater updateTheater(Long id, TheaterDTO theaterDTO){
        Theater theater = theaterRepository.findById(id)
                .orElseThrow(()->new ResourceNotFoundException("No theater found for the id "+id));
        theater.setTheaterName(theaterDTO.getTheaterName());
        theater.setTheaterLocation(theaterDTO.getTheaterLocation());
        theater.setTheaterCapacity(theaterDTO.getTheaterCapacity());
        theater.setTheaterScreenType(theaterDTO.getTheaterScreenType());

        return theaterRepository.save(theater);

    }
    @Override
    public void deleteTheater(Long id){
        Theater theater = theaterRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No theater found for id " + id
                        )
                );
        theaterRepository.deleteById(id);
    }
    @Override
    public List<Theater> getAllTheaters() {
        return theaterRepository.findAll();
    }

}
