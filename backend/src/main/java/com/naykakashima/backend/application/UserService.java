package com.naykakashima.backend.application;

import com.naykakashima.backend.domain.User;

import java.util.Optional;

public interface UserService {
    User createUser(User user);
    Optional<User> getUserByFirebaseUid(String email);
}
