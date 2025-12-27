package com.nightout_reserve.backend.repositories;

import com.nightout_reserve.backend.modules.UserProfiles;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserProfilesRepository extends JpaRepository<UserProfiles, Integer>{
    @Procedure(procedureName = "login")
    UserProfiles login(@Param("usernameIn") String usernameIn);
    
    // TODO: user releted procedure calls from Database here
}
