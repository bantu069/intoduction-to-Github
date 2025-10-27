package com.nwu.cafeteria.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class StatsService {
	private final JdbcTemplate jdbcTemplate;

	public StatsService(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	private static class Where {
		String clause;
		List<Object> params;
	}

	private Where buildWhere(String cafeteria, LocalDate start, LocalDate end) {
		List<String> clauses = new ArrayList<>();
		List<Object> params = new ArrayList<>();
		if (cafeteria != null && !cafeteria.isBlank() && !cafeteria.equals("All")) {
			clauses.add("cafeteria = ?");
			params.add(cafeteria);
		}
		if (start != null) {
			clauses.add("CAST(created_at AS DATE) >= ?");
			params.add(java.sql.Date.valueOf(start));
		}
		if (end != null) {
			clauses.add("CAST(created_at AS DATE) <= ?");
			params.add(java.sql.Date.valueOf(end));
		}
		Where w = new Where();
		w.clause = clauses.isEmpty() ? "" : (" WHERE " + String.join(" AND ", clauses));
		w.params = params;
		return w;
	}

	public Map<String, Object> getStats(String cafeteria, LocalDate start, LocalDate end) {
		Where w = buildWhere(cafeteria, start, end);

		Long total = jdbcTemplate.queryForObject(
			"SELECT COUNT(*) FROM feedback" + w.clause,
			w.params.toArray(), Long.class
		);

		Double avg = jdbcTemplate.queryForObject(
			"SELECT AVG(rating) FROM feedback" + w.clause,
			w.params.toArray(), Double.class
		);

		List<Map<String, Object>> byDay = jdbcTemplate.query(
			"SELECT CAST(created_at AS DATE) AS day, AVG(rating) AS avg_rating, COUNT(*) AS count " +
				"FROM feedback" + w.clause + " GROUP BY CAST(created_at AS DATE) ORDER BY day ASC",
			(rs, i) -> {
				Map<String, Object> m = new LinkedHashMap<>();
				m.put("date", rs.getString("day"));
				m.put("avg_rating", rs.getDouble("avg_rating"));
				m.put("count", rs.getLong("count"));
				return m;
			},
			w.params.toArray()
		);

		List<Map<String, Object>> byCafeteria = jdbcTemplate.query(
			"SELECT cafeteria, AVG(rating) AS avg_rating, COUNT(*) AS count FROM feedback" +
				w.clause + " GROUP BY cafeteria ORDER BY cafeteria",
			(rs, i) -> {
				Map<String, Object> m = new LinkedHashMap<>();
				m.put("cafeteria", rs.getString("cafeteria"));
				m.put("avg_rating", rs.getDouble("avg_rating"));
				m.put("count", rs.getLong("count"));
				return m;
			},
			w.params.toArray()
		);

		Map<String, Long> distribution = new LinkedHashMap<>();
		for (int r = 1; r <= 5; r++) distribution.put(String.valueOf(r), 0L);
		List<Map<String, Object>> distRows = jdbcTemplate.query(
			"SELECT rating, COUNT(*) AS cnt FROM feedback" + w.clause + " GROUP BY rating ORDER BY rating",
			(rs, i) -> {
				Map<String, Object> m = new HashMap<>();
				m.put("rating", rs.getInt("rating"));
				m.put("cnt", rs.getLong("cnt"));
				return m;
			},
			w.params.toArray()
		);
		for (Map<String, Object> row : distRows) {
			String key = String.valueOf(row.get("rating"));
			Long val = (Long) row.get("cnt");
			distribution.put(key, val);
		}

		Map<String, Object> result = new LinkedHashMap<>();
		Map<String, Object> overall = new LinkedHashMap<>();
		overall.put("total", total == null ? 0L : total);
		overall.put("avg_rating", avg);
		result.put("overall", overall);
		result.put("by_day", byDay);
		result.put("by_cafeteria", byCafeteria);
		result.put("distribution", distribution);
		return result;
	}
}

