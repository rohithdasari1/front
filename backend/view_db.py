from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from main import ProjectDB, WorkerDB, ClockEntryDB, Base  # import your DB models

# Connect to SQLite
DATABASE_URL = "sqlite:///./project_management.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)

# Create session
db = SessionLocal()

# ----- VIEW PROJECTS -----
print("Projects:")
projects = db.query(ProjectDB).all()
for p in projects:
    print(f"ID: {p.id}, Name: {p.name}, Status: {p.status}, Description: {p.description}")

# ----- VIEW WORKERS -----
print("\nWorkers:")
workers = db.query(WorkerDB).all()
for w in workers:
    print(f"ID: {w.id}, Name: {w.name}, Role: {w.role}, Assigned Project ID: {w.assigned_project_id}")

# ----- VIEW CLOCK ENTRIES -----
print("\nClock Entries:")
clock_entries = db.query(ClockEntryDB).all()
for c in clock_entries:
    print(f"Worker ID: {c.worker_id}, Project ID: {c.project_id}, Clock In: {c.clock_in_time}, Clock Out: {c.clock_out_time}, Total Hours: {c.total_hours}")

db.close()
