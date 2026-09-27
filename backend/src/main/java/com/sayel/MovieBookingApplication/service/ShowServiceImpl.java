package com.sayel.MovieBookingApplication.service;

import com.sayel.MovieBookingApplication.dto.ShowDTO;
import com.sayel.MovieBookingApplication.dto.TheaterDTO;
import com.sayel.MovieBookingApplication.exception.ResourceNotFoundException;
import com.sayel.MovieBookingApplication.model.Booking;
import com.sayel.MovieBookingApplication.model.Movie;
import com.sayel.MovieBookingApplication.model.Show;
import com.sayel.MovieBookingApplication.model.Theater;
import com.sayel.MovieBookingApplication.repository.MovieRepository;
import com.sayel.MovieBookingApplication.repository.SeatRepository;
import com.sayel.MovieBookingApplication.repository.ShowRepository;
import com.sayel.MovieBookingApplication.repository.TheaterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ShowServiceImpl implements ShowService {
    @Autowired
    private ShowRepository showRepository;
    @Autowired
    private MovieRepository movieRepository;
    @Autowired
    private TheaterRepository theaterRepository;
    @Autowired
    private  SeatRepository seatRepository;
    @Override
    public Show createShow(ShowDTO showDTO){
        Movie movie = movieRepository.findById(showDTO.getMovieId())
                .orElseThrow(()->new ResourceNotFoundException("No Movie Found for id "+showDTO.getMovieId()));
        Theater theater = theaterRepository.findById(showDTO.getTheaterId())
                .orElseThrow(()->new ResourceNotFoundException("No Theater Found for id "+showDTO.getTheaterId()));
        LocalDateTime newStart = showDTO.getShowTime();

        LocalDateTime newEnd =
                newStart.plusMinutes(movie.getDuration());

        List<Show> existingShows =
                showRepository.findByTheaterId(theater.getId());

        for (Show existingShow : existingShows) {

            LocalDateTime existingStart =
                    existingShow.getShowTime();

            LocalDateTime existingEnd =
                    existingStart.plusMinutes(
                            existingShow.getMovie().getDuration()
                    );

            boolean conflict =
                    newStart.isBefore(existingEnd)
                            && newEnd.isAfter(existingStart);

            if (conflict) {
                throw new RuntimeException(
                        "Show time conflicts with an existing show in this theater"
                );
            }
        }
        Show show = new Show();
        show.setShowTime(showDTO.getShowTime());
        show.setPrice(showDTO.getPrice());
        show.setMovie(movie);
        show.setTheater(theater);

        return showRepository.save(show);
    }
    @Override
    public List<Show> getAllShows(){
        return showRepository.findAll();
    }
    @Override
    public List<Show> getShowByMovie(Long movieid){
        List<Show> shows = showRepository.findByMovieId(movieid);

        if (shows.isEmpty()) {
            throw new ResourceNotFoundException(
                    "No shows available for the movie"
            );
        }
        return shows;
    }
    @Override
    public List<Show> getShowByTheater(Long theaterId){
        List<Show> showList = showRepository.findByTheaterId(theaterId);
        if(showList.isEmpty()){
            throw new ResourceNotFoundException("No shows available for the Theater");
        }
        return showList;
    }
    @Override
    public Show updateShow(Long id, ShowDTO showDTO){
        Show show = showRepository.findById(id)
                .orElseThrow(()->new ResourceNotFoundException("No Show available for the id "+id));

        Movie movie = movieRepository.findById(showDTO.getMovieId())
                .orElseThrow(()->new ResourceNotFoundException("No Movie Found for id "+showDTO.getMovieId()));
        Theater theater = theaterRepository.findById(showDTO.getTheaterId())
                .orElseThrow(()->new ResourceNotFoundException("No Theater Found for id "+showDTO.getTheaterId()));
        LocalDateTime newStart = showDTO.getShowTime();

        LocalDateTime newEnd =
                newStart.plusMinutes(movie.getDuration());

        List<Show> existingShows =
                showRepository.findByTheaterId(theater.getId());

        for (Show existingShow : existingShows) {

            if (existingShow.getId().equals(id)) {
                continue;
            }

            LocalDateTime existingStart =
                    existingShow.getShowTime();

            LocalDateTime existingEnd =
                    existingStart.plusMinutes(
                            existingShow.getMovie().getDuration()
                    );

            boolean conflict =
                    newStart.isBefore(existingEnd)
                            && newEnd.isAfter(existingStart);

            if (conflict) {
                throw new RuntimeException(
                        "Updated show time conflicts with another show"
                );
            }
        }

        show.setShowTime(showDTO.getShowTime());
        show.setPrice(showDTO.getPrice());
        show.setMovie(movie);
        show.setTheater(theater);

        return showRepository.save(show);
    }
    @Override
    @Transactional
    public void deleteShow(Long id) {
        Show show = showRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No Show available for the id " + id
                        ));

        if (show.getBookings() != null && !show.getBookings().isEmpty()) {
            throw new RuntimeException(
                    "Can't delete show with existing bookings"
            );
        }

        seatRepository.deleteByShow_Id(id);
        showRepository.deleteById(id);
    }
    @Override
    public Show getShowById(Long id) {
        return showRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No Show available for the id " + id));
    }

}
