package com.nightout_reserve.backend.services;

import com.nightout_reserve.backend.models.User;

import java.util.List;

public interface UserService {
    //get
    User getUserById(Integer id);
    User getUserByEmail(String email);
    User getUserByPhone(String phone);
    List<User> getAllUsers();
    List<User> getUserByUsernameLike(String searchByUsername);

    //create
    User createUser(User userToCreate);


    //update
    User updateUserById(Integer userId, User body);

    //delete
    User softDeleteUserById(Integer id);
    void hardDeleteUser(Integer id);
}
