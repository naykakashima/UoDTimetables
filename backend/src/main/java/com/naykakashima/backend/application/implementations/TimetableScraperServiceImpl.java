package com.naykakashima.backend.application.implementations;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.naykakashima.backend.application.TimetableScraperService;
import com.naykakashima.backend.domain.TimetableEvent;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.IsoFields;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TimetableScraperServiceImpl implements TimetableScraperService {

    @Override
    public List<TimetableEvent> scrape(String url) {
        List<TimetableEvent> events = new ArrayList<>();

        try {
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0")
                    .timeout(15000)
                    .ignoreContentType(true)
                    .get();

            Elements daySpans = doc.select("span.labelone");

            for (Element daySpan : daySpans) {
                String dayName = daySpan.text().trim();
                DayOfWeek dow = parseDayOfWeek(dayName);

                Element table = daySpan.parent().nextElementSibling();
                if (table == null || !table.tagName().equals("table")) continue;

                Elements rows = table.select("tr");

                for (int i = 1; i < rows.size(); i++) { // skip header row
                    Elements cells = rows.get(i).select("td");
                    if (cells.size() < 9) continue;

                    // Extract fields
                    String activity = cells.get(0).text();
                    String moduleName = cells.get(1).text().trim();
                    String type = cells.get(2).text().trim();
                    String startStr = cells.get(3).text().trim();
                    String endStr = cells.get(4).text().trim();
                    String weeksStr = cells.get(6).text().trim();
                    String staff = cells.get(7).text().trim();
                    String location = cells.get(8).text().trim();

                    // Derive module code from activity (first token before space or dash)
                    String moduleCode = activity.split(" ")[0];

                    // Fallback if module name empty
                    if (moduleName.isEmpty()) moduleName = moduleCode;

                    LocalTime startTime = parseTime(startStr);
                    LocalTime endTime = parseTime(endStr);

                    // Expand all weeks
                    for (Integer week : parseWeeks(weeksStr)) {
                        LocalDate mondayOfWeek = getMondayOfIsoWeek(week, Year.now().getValue());
                        LocalDate actualDate = mondayOfWeek.plusDays(dow.getValue() - 1);
                        LocalDateTime startDT = LocalDateTime.of(actualDate, startTime);
                        LocalDateTime endDT = LocalDateTime.of(actualDate, endTime);

                        // Compose description
                        String description = type + " | " + staff;

                        TimetableEvent event = TimetableEvent.builder()
                                .title(moduleName)
                                .description(description)
                                .location(location)
                                .startTime(startDT)
                                .endTime(endDT)
                                .weekNumber(week)
                                .moduleCode(moduleCode)
                                .uid(generateUid(moduleCode, week, dow, startTime))
                                .build();

                        events.add(event);
                    }
                }
            }

        } catch (Exception e) {
            throw new RuntimeException("Scraping failed: " + e.getMessage());
        }

        return events;
    }

    // Mock loader
    @Override
    public List<TimetableEvent> loadMockTimetable() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            // Register JavaTimeModule to handle LocalDateTime / LocalTime
            mapper.registerModule(new JavaTimeModule());

            InputStream is = new ClassPathResource("mock-timetable.json").getInputStream();
            return mapper.readValue(is, new TypeReference<List<TimetableEvent>>() {});
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    // --- Helpers ---

    private int extractFirstWeekNumber(String url) {
        // &weeks=12-22 → returns 12
        String weeks = url.split("weeks=")[1].split("&")[0];
        return Integer.parseInt(weeks.split("-")[0]);
    }

    private LocalDate getMondayOfIsoWeek(int week, int year) {
        return LocalDate
                .of(year, 1, 4)
                .with(IsoFields.WEEK_OF_WEEK_BASED_YEAR, week)
                .with(DayOfWeek.MONDAY);
    }

    private DayOfWeek parseDayOfWeek(String text) {
        return switch (text.toLowerCase()) {
            case "monday" -> DayOfWeek.MONDAY;
            case "tuesday" -> DayOfWeek.TUESDAY;
            case "wednesday" -> DayOfWeek.WEDNESDAY;
            case "thursday" -> DayOfWeek.THURSDAY;
            case "friday" -> DayOfWeek.FRIDAY;
            case "saturday" -> DayOfWeek.SATURDAY;
            case "sunday" -> DayOfWeek.SUNDAY;
            default -> throw new RuntimeException("Unknown day: " + text);
        };
    }

    private LocalTime parseTime(String time) {
        return LocalTime.parse(time, DateTimeFormatter.ofPattern("H:mm"));
    }

    private List<Integer> parseWeeks(String weeksStr) {
        List<Integer> weeks = new ArrayList<>();
        if (weeksStr.isEmpty()) return weeks;
        for (String part : weeksStr.split(",")) {
            part = part.trim();
            if (part.contains("-")) {
                String[] range = part.split("-");
                int start = Integer.parseInt(range[0].trim());
                int end = Integer.parseInt(range[1].trim());
                for (int i = start; i <= end; i++) weeks.add(i);
            } else {
                weeks.add(Integer.parseInt(part));
            }
        }
        return weeks;
    }

    private String generateUid(String moduleCode, int week, DayOfWeek day, LocalTime startTime) {
        return moduleCode + "-" + week + "-" + day.getValue() + "-" + startTime.toString();
    }
}
