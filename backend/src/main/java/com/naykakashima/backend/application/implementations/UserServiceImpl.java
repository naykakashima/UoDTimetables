package com.naykakashima.backend.application.implementations;

import com.naykakashima.backend.application.UserService;
import com.naykakashima.backend.domain.User;
import com.naykakashima.backend.infrastructure.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;

    @Override
    public User createUser(User user){
        return userRepository.save(user);
    }

    @Override
    public Optional<User> getUserByFirebaseUid(String firebaseUid){
        return  userRepository.findByFirebaseUid(firebaseUid);
    }

}
