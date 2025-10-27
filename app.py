import os
import csv
from datetime import datetime
from io import StringIO
from typing import Optional

from flask import Flask, render_template, request, redirect, url_for, jsonify, make_response

from database import init_db, get_connection, build_filters_clause


CAFETERIAS = [
	"Student Centre",
	"Engineering",
	"Science",
	"Law",
	"Education",
	"Health Sciences",
	"Commerce",
	"Residence A",
	"Residence B",
]


def create_app() -> Flask:
	app = Flask(__name__)
	app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret")

	# Ensure DB exists
	init_db()

	@app.get("/")
	def index():
		ok = request.args.get("ok")
		return render_template("index.html", cafeterias=CAFETERIAS, ok=ok)

	@app.post("/submit")
	def submit_feedback():
		cafeteria = request.form.get("cafeteria")
		try:
			rating = int(request.form.get("rating", ""))
		except ValueError:
			rating = 0
		comments = request.form.get("comments", "").strip()

		if cafeteria not in CAFETERIAS or rating < 1 or rating > 5:
			return redirect(url_for("index"))

		with get_connection() as conn:
			conn.execute(
				"""
				INSERT INTO feedback (cafeteria, rating, comments, ip_address, user_agent)
				VALUES (?, ?, ?, ?, ?)
				""",
				(
					cafeteria,
					rating,
					comments or None,
					request.headers.get("X-Forwarded-For", request.remote_addr),
					request.headers.get("User-Agent"),
				),
			)
			conn.commit()

		return redirect(url_for("index", ok=1))

	@app.get("/dashboard")
	def dashboard():
		return render_template("dashboard.html", cafeterias=["All"] + CAFETERIAS)

	@app.get("/api/stats")
	def api_stats():
		cafeteria = request.args.get("cafeteria")
		start_date_str = request.args.get("start_date")
		end_date_str = request.args.get("end_date")

		start_date: Optional[str] = None
		end_date: Optional[str] = None
		if start_date_str:
			start_date = start_date_str
		if end_date_str:
			end_date = end_date_str

		where_clause, params = build_filters_clause(cafeteria, start_date, end_date)

		with get_connection() as conn:
			# Overall
			row = conn.execute(
				f"SELECT COUNT(*), AVG(rating) FROM feedback {where_clause}", params
			).fetchone()
			total = row[0] or 0
			avg_rating = float(row[1]) if row[1] is not None else None

			# By day
			rows = conn.execute(
				f"""
				SELECT DATE(created_at) as day, AVG(rating) as avg_rating, COUNT(*) as count
				FROM feedback
				{where_clause}
				GROUP BY day
				ORDER BY day ASC
				""",
				params,
			).fetchall()
			by_day = [
				{"date": r[0], "avg_rating": float(r[1]), "count": r[2]} for r in rows
			]

			# By cafeteria
			rows = conn.execute(
				f"""
				SELECT cafeteria, AVG(rating) as avg_rating, COUNT(*) as count
				FROM feedback
				{where_clause}
				GROUP BY cafeteria
				ORDER BY cafeteria ASC
				""",
				params,
			).fetchall()
			by_cafeteria = [
				{"cafeteria": r[0], "avg_rating": float(r[1]), "count": r[2]} for r in rows
			]

			# Distribution
			dist_rows = conn.execute(
				f"""
				SELECT rating, COUNT(*)
				FROM feedback
				{where_clause}
				GROUP BY rating
				ORDER BY rating ASC
				""",
				params,
			).fetchall()
			distribution = {str(r[0]): r[1] for r in dist_rows}
			for rating_value in range(1, 6):
				distribution.setdefault(str(rating_value), 0)

		return jsonify(
			{
				"overall": {"total": total, "avg_rating": avg_rating},
				"by_day": by_day,
				"by_cafeteria": by_cafeteria,
				"distribution": distribution,
			}
		)

	@app.get("/api/export.csv")
	def export_csv():
		cafeteria = request.args.get("cafeteria")
		start_date_str = request.args.get("start_date")
		end_date_str = request.args.get("end_date")

		where_clause, params = build_filters_clause(cafeteria, start_date_str, end_date_str)

		with get_connection() as conn:
			rows = conn.execute(
				f"""
				SELECT id, cafeteria, rating, comments, datetime(created_at) as created_at
				FROM feedback
				{where_clause}
				ORDER BY created_at DESC
				""",
				params,
			).fetchall()

		si = StringIO()
		writer = csv.writer(si)
		writer.writerow(["id", "cafeteria", "rating", "comments", "created_at"])
		for r in rows:
			writer.writerow([r[0], r[1], r[2], r[3] or "", r[4]])

		output = make_response(si.getvalue())
		output.headers["Content-Disposition"] = "attachment; filename=feedback_export.csv"
		output.headers["Content-Type"] = "text/csv"
		return output

	return app


app = create_app()


if __name__ == "__main__":
	port = int(os.environ.get("PORT", 5000))
	app.run(host="0.0.0.0", port=port, debug=True)

