package com.nightout_reserve.backend.exceptions;

public class UserIsDeletedExistsException extends RuntimeException {
    public UserIsDeletedExistsException(String message) {
        super(message);
    }
}
