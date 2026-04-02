package com.nightout_reserve.backend.repositories;

import com.nightout_reserve.backend.models.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface VenueRepository extends JpaRepository<Venue, Integer> {

    @Query("SELECT v FROM Venue v WHERE v.name LIKE %:venueName%")
    List<Venue> findVenuesByNameLike(String venueName);

}
