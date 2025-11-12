package com.naykakashima.backend.infrastructure;

import com.naykakashima.backend.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User,Long> {
    Optional<User> findByFirebaseUid(String firebaseUid);
}
