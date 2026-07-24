from app import app, init_db, migrate_data

with app.app_context():
    init_db()
    migrated = migrate_data()

if migrated:
    print(f"Migrated {migrated} projects into projects.db")
else:
    print("Migration skipped: the projects table already contains data")
