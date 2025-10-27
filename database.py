import os
import sqlite3
from typing import Optional, Tuple, List


BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, "nwu_cafeteria.db")


def get_connection() -> sqlite3.Connection:
	conn = sqlite3.connect(DB_PATH)
	conn.row_factory = sqlite3.Row
	return conn


def init_db() -> None:
	with get_connection() as conn:
		conn.execute(
			"""
			CREATE TABLE IF NOT EXISTS feedback (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				cafeteria TEXT NOT NULL,
				rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
				comments TEXT,
				ip_address TEXT,
				user_agent TEXT,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			)
			"""
		)
		conn.commit()


def build_filters_clause(
	cafeteria: Optional[str], start_date: Optional[str], end_date: Optional[str]
) -> Tuple[str, List[str]]:
	clauses = []
	params: List[str] = []
	if cafeteria and cafeteria != "All":
		clauses.append("cafeteria = ?")
		params.append(cafeteria)
	if start_date:
		clauses.append("DATE(created_at) >= ?")
		params.append(start_date)
	if end_date:
		clauses.append("DATE(created_at) <= ?")
		params.append(end_date)
	where_clause = "WHERE " + " AND ".join(clauses) if clauses else ""
	return where_clause, params

