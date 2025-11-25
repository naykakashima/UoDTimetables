# UoDTimetables

UoDTimetables is a mobile application designed to simplify timetable management for University of Dundee students. It allows users to import their eVision timetables, view them in an interactive calendar, navigate campus buildings, and export schedules to external calendar apps.  

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Environment Variables](#environment-variables)
- [Usage](#usage)

---

## Features
- Import timetable from eVision (HTML scrape → ICS conversion)
- Interactive calendar display (weekly/daily views)
- Campus map navigation (GPS integration)
- Export to Google/Apple Calendar
- Secure authentication with Firebase

---

## Tech Stack
**Backend:**  
- Java 17, Spring Boot  
- PostgreSQL  
- Firebase Authentication  

**Frontend:**  
- React Native (Expo)  

**Other Tools:**  
- Postman (API testing)  
- PgAdmin 4 (DB management)  
- UoD digital design system for UI consistency  

---

## Setup Instructions

### Backend
1. Clone the repository:  
   ```
   git clone https://github.com/naykakashima/UoDTimetables.git
   cd UoDTimetables/backend
   ```
2. Copy the example configuration file and fill in your PostgreSQL credentials:
    ```
    cp src/main/resources/application.yml.example src/main/resources/application.yml
    ```
    - Update (refer to application.yml.example)
        ```
        spring:
        datasource:
            url: jdbc:postgresql://localhost:5432/your_db_name
            username: your_username
            password: your_password
        ```
3. Make sure you have Java 17 installed and Maven (wrapper included with the project).
    - Maven wrapper version: 3.3.4
4. Build and run the backend:
    ```
    ./mvnw clean install
    ./mvnw spring-boot:run
    ```
5. The backend will start on http://localhost:8080.

### Frontend
1. Navigate to the frontend directory:
    ```
    cd ../frontend
    ```
2. Copy .env.example to .env and add your backend IP:
    ```
    EXPO_PUBLIC_API_IP=http://<your-laptop-ip>:8080
    ```
3. Install dependencies:
    ```
    npm install
    ```
4. Run the Expo app:
    ```
    npx expo start
    ```
5. Scan the QR code with your mobile device (Expo Go) to test the app.

## Environment Variables
- EXPO_PUBLIC_API_IP: The IP address of your machine running the backend server. Must be accessible on your device network.

---

## Project Structure

- Frontend
    ```
    frontend
    ├── App
    ├── assets
    │ ├── fonts
    │ └── images
    ├── components
    │ ├── CalendarView.js
    │ ├── MapView.js
    │ └── TimetableItem.js
    ├── screens
    │ ├── LoginScreen.js
    │ ├── CalendarScreen.js
    │ └── MapScreen.js
    ├── navigation
    │ └── AppNavigator.js
    ├── .env
    ├── package.json
    └── app.json
    ```
- Backend
    ```
    backend/src/main/java/com/naykakashima/backend
    ├── application
    │ └── implementations
    ├── config
    │ └── SecurityConfig
    │ └── java
    ├── domain
    ├── infrastructure
    │ └── repository
    └── presentation
    ```

---

## Usage
1. Start the backend server.
2. Start the frontend Expo app.
3. Import your eVision timetable link into the app.
4. View your timetable, navigate campus, and export to Google/Apple Calendar.
