package com.naykakashima.backend.application;

import com.naykakashima.backend.domain.TimetableEvent;

import java.util.List;

public interface TimetableEventService {
    TimetableEvent createEvent(TimetableEvent event);
    List<TimetableEvent> getEventByUserId(String userId);
}
