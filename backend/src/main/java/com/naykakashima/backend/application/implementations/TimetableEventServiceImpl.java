package com.naykakashima.backend.application.implementations;

import com.naykakashima.backend.application.TimetableEventService;
import com.naykakashima.backend.domain.TimetableEvent;
import com.naykakashima.backend.infrastructure.repository.TimetableEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TimetableEventServiceImpl implements TimetableEventService {
    private final TimetableEventRepository timetableEventRepository;

    public TimetableEvent createEvent(TimetableEvent event){
        return timetableEventRepository.save(event);
    }

    public List<TimetableEvent> getEventByUserId(String userId){
        return timetableEventRepository.findByUserId(userId);
    }
}
