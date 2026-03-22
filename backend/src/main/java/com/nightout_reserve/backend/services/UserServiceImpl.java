package com.nightout_reserve.backend.services;


import com.nightout_reserve.backend.models.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.nightout_reserve.backend.repositories.UserRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserServiceImpl implements UserService{

    @Autowired
    private UserRepository userRepository;


    @Override
    public User getUserById(Integer id) {
        return userRepository.findById(id).orElseThrow(
                () -> new RuntimeException("User with "+id+" not found")
        );
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public User getUserByPhone(String phone) {
        return userRepository.findByPhone(phone);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public List<User> getUsersByUsernameLike(String searchByUsername) {
        return userRepository.findUsersByUsernameLike(searchByUsername);
    }

    @Override
    public User createUser(User userToCreate) {
        return userRepository.save(userToCreate);
    }

    @Override
    public User updateUserById(Integer userId, User body) {
        User userToUpdate = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User with id "+userId+" not found"));

        userToUpdate.setUsername(body.getUsername());
        userToUpdate.setEmail(body.getEmail());

        if (body.getPhone() != null) {
            userToUpdate.setPhone(body.getPhone());
        } else {
            userToUpdate.setPhone(userToUpdate.getPhone());
        }
        return userRepository.save(userToUpdate);
    }

    @Override
    public User softDeleteUserById(Integer id) {
        User userToSoftDelete = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User with id "+ id+ "not found"));

        userToSoftDelete.setIsDeleted(true);
        userToSoftDelete.setDeletedAt(LocalDateTime.now());

        return userRepository.save(userToSoftDelete);

    }

    @Override
    public void hardDeleteUserById(Integer id) {
        System.out.println("Deleting user with id "+ id);
        userRepository.deleteById(id);
    }
}
