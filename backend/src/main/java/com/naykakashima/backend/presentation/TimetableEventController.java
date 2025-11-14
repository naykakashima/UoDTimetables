package com.naykakashima.backend.presentation;

import com.naykakashima.backend.application.TimetableEventService;
import com.naykakashima.backend.application.TimetableScraperService;
import com.naykakashima.backend.domain.TimetableEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/timetable")
public class TimetableEventController {
    private final TimetableEventService eventService;

    @PostMapping("/createEvent")
    public ResponseEntity<TimetableEvent> createEvent(@RequestBody TimetableEvent timetableEvent){
        TimetableEvent savedEvent = eventService.createEvent(timetableEvent);
        return ResponseEntity.ok(savedEvent);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TimetableEvent>> getEventByUserId(@PathVariable String userId){
        List<TimetableEvent> events = eventService.getEventByUserId(userId);
        return ResponseEntity.ok(events);
    }

    @PostMapping("/import")
    public ResponseEntity<List<TimetableEvent>> importTimetable(@RequestBody Map<String, String> payload){
        String studentId = payload.get("studentId");
        List<TimetableEvent> events = eventService.importForStudents(studentId);
        return ResponseEntity.ok(events);
    }

}
