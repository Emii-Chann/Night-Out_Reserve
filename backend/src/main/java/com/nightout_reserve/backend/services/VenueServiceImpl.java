package com.nightout_reserve.backend.services;


import com.nightout_reserve.backend.models.Venue;
import com.nightout_reserve.backend.repositories.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class VenueServiceImpl implements VenueService{

    @Autowired
    VenueRepository venueRepository;

    @Override
    public Venue getVenueById(Integer id) {
        return null;
    }

    @Override
    public List<Venue> getALVenues() {
        return List.of();
    }

    @Override
    public List<Venue> getVenuesByOwnerId(Integer ownerId) {
        return List.of();
    }

    @Override
    public List<Venue> getVenuesByCity(String cityName) {
        return List.of();
    }

    @Override
    public List<Venue> getVenuesByOpenNow(LocalDateTime now) {
        return List.of();
    }

    @Override
    public List<Venue> getVenueByNameLike(String venueName) {
        return List.of();
    }

    @Override
    public Venue createVenue(Venue venue) {
        return null;
    }

    @Override
    public Venue updateVenueById(Integer venueId, Venue body) {
        return null;
    }

//    @Override
//    public Venue softDeleteVenueById(Integer venueId) {
//        Venue venueToSoftDelete = venueRepository.findById(venueId).orElseThrow(()
//                -> new RuntimeException("Venue with id: "+venueId+" not found"));

        //TODO
//    }

//    @Override
//    public void hardDeleteVenueById(Integer venueId) {
        //TODO
//    }
}
