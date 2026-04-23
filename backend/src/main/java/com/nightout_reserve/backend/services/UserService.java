package com.nightout_reserve.backend.services;

import com.nightout_reserve.backend.dto.UserRegistrationDTO;
import com.nightout_reserve.backend.models.User;

import java.util.List;

public interface UserService {
    
    User getUserById(Integer id);
    User getUserByEmail(String email);
    User getUserByPhone(String phone);
    List<User> getAllUsers();
    List<User> getUsersByUsernameLike(String searchByUsername);

    
    User createUser(UserRegistrationDTO dto);

    
    User updateUserById(Integer userId, User body);

    
    User softDeleteUserById(Integer id);
    void hardDeleteUserById(Integer id);
}
