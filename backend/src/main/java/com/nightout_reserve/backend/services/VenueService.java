package com.nightout_reserve.backend.services;

import com.nightout_reserve.backend.models.Venue;
import com.nightout_reserve.backend.repositories.VenueRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface VenueService {
    //get
    Venue getVenueById(Integer id);
    List<Venue> getALVenues();
    List<Venue> getVenuesByOwnerId(Integer ownerId);
    List<Venue> getVenuesByCity(String cityName);
    List<Venue> getVenuesByOpenNow(LocalDateTime now);
    List<Venue> getVenueByNameLike(String venueName);

    //create
    Venue createVenue(Venue venue);

    //update
    Venue updateVenueById(Integer venueId, Venue body);

    //delete TODO
//    Venue softDeleteVenueById(Integer venueId);
//    void hardDeleteVenueById(Integer venueId);


}
