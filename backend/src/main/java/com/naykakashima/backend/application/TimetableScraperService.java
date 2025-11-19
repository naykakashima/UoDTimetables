package com.naykakashima.backend.application;

import com.naykakashima.backend.domain.TimetableEvent;

import java.util.List;

public interface TimetableScraperService {
    List<TimetableEvent> scrape(String url);
    List<TimetableEvent> loadMockTimetable();
}
