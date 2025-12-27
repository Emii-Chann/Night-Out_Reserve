package com.nightout_reserve.backend.exceptions;

public class UserWrongPasswordException extends RuntimeException {
    public UserWrongPasswordException(String message) {
        super(message);
    }
}