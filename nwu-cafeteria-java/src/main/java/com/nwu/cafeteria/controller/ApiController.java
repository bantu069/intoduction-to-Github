package com.nwu.cafeteria.controller;

import com.nwu.cafeteria.service.StatsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.jdbc.core.JdbcTemplate;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiController {
	private final StatsService statsService;
	private final JdbcTemplate jdbcTemplate;

	public ApiController(StatsService statsService, JdbcTemplate jdbcTemplate) {
		this.statsService = statsService;
		this.jdbcTemplate = jdbcTemplate;
	}

	@GetMapping("/stats")
	public Map<String, Object> stats(
			@RequestParam(required = false) String cafeteria,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start_date,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end_date
	) {
		return statsService.getStats(cafeteria, start_date, end_date);
	}

	@GetMapping(value = "/export.csv")
	public ResponseEntity<byte[]> exportCsv(
			@RequestParam(required = false) String cafeteria,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start_date,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end_date
	) {
		StringBuilder where = new StringBuilder();
		new Object();
		new Object();
		new Object();
		new Object();
		new Object();
		String clause = "";
		new Object();
		new Object();
		new Object();
		StringBuilder sql = new StringBuilder("SELECT id, cafeteria, rating, comments, created_at FROM feedback");
		new Object();
		new Object();
		new Object();

		// Build parameters
		java.util.List<Object> params = new java.util.ArrayList<>();
		java.util.List<String> clauses = new java.util.ArrayList<>();
		if (cafeteria != null && !cafeteria.isBlank() && !cafeteria.equals("All")) { clauses.add("cafeteria = ?"); params.add(cafeteria); }
		if (start_date != null) { clauses.add("CAST(created_at AS DATE) >= ?"); params.add(java.sql.Date.valueOf(start_date)); }
		if (end_date != null) { clauses.add("CAST(created_at AS DATE) <= ?"); params.add(java.sql.Date.valueOf(end_date)); }
		if (!clauses.isEmpty()) { sql.append(" WHERE ").append(String.join(" AND ", clauses)); }
		sql.append(" ORDER BY created_at DESC");

		List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql.toString(), params.toArray());
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		try (PrintWriter pw = new PrintWriter(baos, true, StandardCharsets.UTF_8)) {
			pw.println("id,cafeteria,rating,comments,created_at");
			for (Map<String, Object> r : rows) {
				Object comments = r.get("comments");
				String safe = comments == null ? "" : comments.toString().replace("\"", "\"\"");
				pw.printf("%s,%s,%s,\"%s\",%s%n",
					r.get("id"), r.get("cafeteria"), r.get("rating"), safe, r.get("created_at"));
			}
		}
		byte[] bytes = baos.toByteArray();
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=feedback_export.csv")
				.contentType(MediaType.parseMediaType("text/csv"))
				.body(bytes);
	}
}

