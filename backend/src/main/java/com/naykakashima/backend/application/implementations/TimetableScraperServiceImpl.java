package com.naykakashima.backend.application.implementations;

import com.naykakashima.backend.application.TimetableScraperService;
import com.naykakashima.backend.domain.TimetableEvent;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document; // <-- correct import
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TimetableScraperServiceImpl implements TimetableScraperService {
    @Override
    public List<TimetableEvent> scrape(String url){
        try{
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36")
                    .timeout(20_000)   // 20 seconds
                    .ignoreHttpErrors(true) // continue even if non-200 returned
                    .ignoreContentType(true) // if content type is not HTML
                    .get();


            System.out.println(doc.html());
            return Collections.emptyList();
        } catch (Exception e){
            throw new RuntimeException("Scraping failed");
        }
    }
}
