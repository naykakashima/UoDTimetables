package com.naykakashima.backend.application.implementations;

import com.naykakashima.backend.application.TimetableEventService;
import com.naykakashima.backend.application.TimetableScraperService;
import com.naykakashima.backend.domain.TimetableEvent;
import com.naykakashima.backend.infrastructure.repository.TimetableEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TimetableEventServiceImpl implements TimetableEventService {
    private final TimetableEventRepository timetableEventRepository;
    private final TimetableScraperService scraper;

    @Override
    public TimetableEvent createEvent(TimetableEvent event){
        return timetableEventRepository.save(event);
    }

    @Override
    public List<TimetableEvent> getEventByUserId(String userId){
        return timetableEventRepository.findByUserId(userId);
    }

    @Override
    public List<TimetableEvent> importForStudents(String studentId){
        String url = buildUrl(studentId);
        return scraper.scrape(url);
    }

    private String buildUrl(String studentId) {
        String url = "https://timetable.dundee.ac.uk:8086/reporting/textspreadsheet"
                + "?objectclass=student+set"
                + "&idtype=id"
                + "&identifier=" + studentId + "/1"
                + "&t=SWSCUST+student+set+textspreadsheet"
                + "&days=1-7"
                + "&weeks=12-22"
                + "&periods=1-28"
                + "&template=SWSCUST+student+set+textspreadsheet";

        System.out.println("Built timetable URL: " + url); // <- debug
        return url;
    }

}
