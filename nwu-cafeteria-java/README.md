# NWU Cafeteria Satisfaction Monitor (Java, Spring Boot)

Prerequisites:
- JDK 17+
- Maven 3.9+

Run locally:
```bash
cd nwu-cafeteria-java
mvn spring-boot:run
```

App: http://localhost:8080
- `/` feedback form
- `/dashboard` dashboard
- `/api/stats` stats API
- `/api/export.csv` CSV export
- `/h2` H2 console (JDBC `jdbc:h2:file:./nwu_cafeteria_db`)

Build jar:
```bash
mvn -DskipTests package
java -jar target/cafeteria-0.0.1-SNAPSHOT.jar
```

Config: see `src/main/resources/application.properties`.