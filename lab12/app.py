from pathlib import Path
import json
import sqlite3

from flask import (
    Flask,
    g,
    jsonify,
    redirect,
    render_template,
    request,
    send_from_directory,
    url_for,
)

BASE_DIR = Path(__file__).resolve().parent
DATABASE = BASE_DIR / "projects.db"
DATA_FILE = BASE_DIR / "projects.json"

app = Flask(
    __name__,
    static_folder="public",
    static_url_path=""
)


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(error=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    db = get_db()
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            language TEXT NOT NULL,
            url TEXT NOT NULL
        )
        """
    )
    db.commit()


def migrate_data():
    db = get_db()
    existing_count = db.execute(
        "SELECT COUNT(*) AS total FROM projects"
    ).fetchone()["total"]

    if existing_count > 0:
        return 0

    with DATA_FILE.open("r", encoding="utf-8") as file:
        projects = json.load(file)

    for project in projects:
        db.execute(
            """
            INSERT INTO projects (title, description, language, url)
            VALUES (?, ?, ?, ?)
            """,
            (
                project["title"],
                project["description"],
                project["language"],
                project["url"],
            ),
        )

    db.commit()
    return len(projects)


def row_to_project(row):
    return {
        "id": row["id"],
        "name": row["title"],
        "description": row["description"],
        "language": row["language"],
        "html_url": row["url"],
    }


@app.route("/")
def home():
    return send_from_directory(app.static_folder, "index.html")


@app.route("/api/projects")
def get_projects():
    rows = get_db().execute(
        "SELECT * FROM projects ORDER BY id"
    ).fetchall()

    return jsonify([row_to_project(row) for row in rows])


@app.route("/projects/<int:project_id>")
def get_project(project_id):
    row = get_db().execute(
        "SELECT * FROM projects WHERE id = ?",
        (project_id,),
    ).fetchone()

    if row is None:
        return render_template("404.html"), 404

    return render_template(
        "project.html",
        project=row_to_project(row),
    )


@app.route("/projects/new", methods=["GET", "POST"])
def new_project():
    if request.method == "GET":
        return render_template("new_project.html")

    title = request.form.get("title", "").strip()
    description = request.form.get("description", "").strip()
    language = request.form.get("language", "").strip()
    url = request.form.get("url", "").strip()

    if not title or not description or not language or not url:
        return render_template(
            "new_project.html",
            error="All fields are required.",
            values=request.form,
        ), 400

    db = get_db()
    cursor = db.execute(
        """
        INSERT INTO projects (title, description, language, url)
        VALUES (?, ?, ?, ?)
        """,
        (title, description, language, url),
    )
    db.commit()

    return redirect(
        url_for("get_project", project_id=cursor.lastrowid)
    )


@app.route("/contact", methods=["POST"])
def contact():
    name = request.form.get("name", "Guest").strip() or "Guest"
    email = request.form.get("email", "").strip()
    subject = request.form.get("subject", "").strip()
    message = request.form.get("message", "").strip()

    return render_template(
        "thanks.html",
        name=name,
        email=email,
        subject=subject,
        message=message,
    )


if __name__ == "__main__":
    with app.app_context():
        init_db()

    app.run(debug=True)
