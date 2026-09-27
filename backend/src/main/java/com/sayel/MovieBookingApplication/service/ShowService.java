package com.sayel.MovieBookingApplication.service;

import com.sayel.MovieBookingApplication.dto.ShowDTO;
import com.sayel.MovieBookingApplication.model.Show;

import java.util.List;

public interface ShowService {

    Show createShow(ShowDTO showDTO);

    List<Show> getAllShows();

    List<Show> getShowByMovie(Long movieid);

    List<Show> getShowByTheater(Long theaterId);

    Show updateShow(Long id, ShowDTO showDTO);

    void deleteShow(Long id);

    Show getShowById(Long id);
}