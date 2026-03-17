package com.nightout_reserve.backend.repositories;

import com.nightout_reserve.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Integer>{
    @Procedure(procedureName = "login")
    User login(@Param("usernameIn") String usernameIn);

    @Query("SELECT u FROM User u WHERE u.email = :email")
    User findByEmail(@Param("email") String email);

    User findByPhone(String phone);


    @Query("SELECT u FROM User u WHERE u.username LIKE :username")
    List<User> findUsersByUsernameLike(@Param("username") String username);
}
