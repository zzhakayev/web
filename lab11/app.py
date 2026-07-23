from flask import Flask, jsonify, render_template, request, send_from_directory

app = Flask(
    __name__,
    static_folder="public",
    static_url_path=""
)

projects = [
    {
        "id": 1,
        "name": "University System",
        "description": "A university management system similar to Platonus.",
        "language": "Vue.js",
        "html_url": "https://github.com/zzhakayev"
    },
    {
        "id": 2,
        "name": "Digital Library",
        "description": "A digital library website for finding and reading books.",
        "language": "JavaScript",
        "html_url": "https://github.com/zzhakayev"
    }
]


@app.route("/")
def home():
    return send_from_directory(app.static_folder, "index.html")


@app.route("/api/projects")
def get_projects():
    return jsonify(projects)


@app.route("/projects/<int:project_id>")
def get_project(project_id):
    project = next(
        (item for item in projects if item["id"] == project_id),
        None
    )

    if project is None:
        return render_template("404.html"), 404

    return render_template("project.html", project=project)


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
        message=message
    )


if __name__ == "__main__":
    app.run(debug=True)
