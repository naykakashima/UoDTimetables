package com.naykakashima.backend.infrastructure.repository;

import com.naykakashima.backend.domain.TimetableEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TimetableEventRepository extends JpaRepository<TimetableEvent,Long> {
    List<TimetableEvent> findByUserId(String userId);
}
