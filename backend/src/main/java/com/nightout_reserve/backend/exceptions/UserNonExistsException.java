package com.nightout_reserve.backend.exceptions;

public class UserNonExistsException extends RuntimeException {
    public UserNonExistsException(String message) {
        super(message);
    }
}