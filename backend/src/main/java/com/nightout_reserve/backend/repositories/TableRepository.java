// package com.nightout_reserve.backend.repositories;

// import com.nightout_reserve.backend.models.Table;
// import com.nightout_reserve.backend.models.Venue;
// import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.data.jpa.repository.Query;
// import org.springframework.data.repository.query.Param;

// import java.util.List;

// public interface TableRepository extends JpaRepository<Table, Integer> {

//     @Query("SELECT t FROM Table t WHERE t.venue.id == :id")
//     List<Table> findByVenueId(Integer id);
// }
