from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import pytz

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session

# -------------------------------
# DATABASE SETUP
# -------------------------------
DATABASE_URL = "sqlite:///./project_management.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
ist = pytz.timezone("Asia/Kolkata")

# -------------------------------
# DATABASE MODELS
# -------------------------------
class ProjectDB(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    status = Column(String, default="Planned")
    workers = relationship("WorkerDB", back_populates="project")
    # Add relationship for get_clock_entries to work
    clock_entries = relationship("ClockEntryDB", back_populates="project")

class WorkerDB(Base):
    __tablename__ = "workers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    role = Column(String)
    assigned_project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    project = relationship("ProjectDB", back_populates="workers")
    clock_entries = relationship("ClockEntryDB", back_populates="worker")

class ClockEntryDB(Base):
    __tablename__ = "clock_entries"
    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"))
    project_id = Column(Integer, ForeignKey("projects.id"))
    clock_in_time = Column(DateTime, default=lambda: datetime.now(ist))
    clock_out_time = Column(DateTime, nullable=True)
    total_hours = Column(Float, nullable=True)
    worker = relationship("WorkerDB", back_populates="clock_entries")
    # Add relationship for get_clock_entries to work
    project = relationship("ProjectDB", back_populates="clock_entries")

class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String)

Base.metadata.create_all(bind=engine)

# -------------------------------
# Pydantic MODELS
# -------------------------------
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: str = "Planned"

class Project(ProjectBase):
    id: int
    class Config:
        orm_mode = True

class WorkerBase(BaseModel):
    name: str
    role: str
    assigned_project_id: Optional[int] = None

class Worker(WorkerBase):
    id: int
    class Config:
        orm_mode = True

class AssignRequest(BaseModel):
    worker_id: int

class ClockInRequest(BaseModel):
    worker_id: int
    project_id: int
    timestamp: Optional[str] = None

class ClockOutRequest(BaseModel):
    worker_id: int
    project_id: int
    timestamp: Optional[str] = None

class ClockEntryResponse(BaseModel):
    id: int
    worker_id: int
    project_id: int
    worker_name: str
    project_name: str
    clock_in_time: datetime
    clock_out_time: Optional[datetime] = None
    total_hours: Optional[float] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class User(BaseModel):
    id: int
    username: str
    role: str
    class Config:
        orm_mode = True

class ChatRequest(BaseModel):
    query: str

# -------------------------------
# FASTAPI SETUP
# -------------------------------
app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------------------
# SEED USERS
# -------------------------------
def seed_users():
    db = SessionLocal()
    if db.query(UserDB).count() == 0:
        users = [
            UserDB(username="manager1", password="manager123", role="Manager"),
            UserDB(username="supervisor1", password="supervisor123", role="Supervisor"),
            UserDB(username="worker1", password="worker123", role="Worker"),
        ]
        db.add_all(users)
        db.commit()
    db.close()
seed_users()

# -------------------------------
# ROUTES
# -------------------------------
@app.get("/")
def root():
    return {"message": "Backend running successfully"}

# ---------- LOGIN ----------
@app.post("/login", response_model=User)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(
        UserDB.username == request.username,
        UserDB.password == request.password
    ).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return user

# ---------- PROJECTS ----------
@app.post("/projects/", response_model=Project)
def create_project(project: ProjectBase, db: Session = Depends(get_db)):
    new_project = ProjectDB(**project.dict())
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

@app.get("/projects/", response_model=List[Project])
def get_projects(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(ProjectDB)
    if status:
        query = query.filter(ProjectDB.status.ilike(status))
    return query.all()

# ---------- WORKERS ----------
@app.post("/workers/", response_model=Worker)
def create_worker(worker: WorkerBase, db: Session = Depends(get_db)):
    new_worker = WorkerDB(**worker.dict())
    db.add(new_worker)
    db.commit()
    db.refresh(new_worker)
    return new_worker

@app.get("/workers/", response_model=List[Worker])
def get_workers(project_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(WorkerDB)
    if project_id:
        query = query.filter(WorkerDB.assigned_project_id == project_id)
    return query.all()

@app.post("/projects/{project_id}/assign")
def assign_worker(project_id: int, request: AssignRequest, db: Session = Depends(get_db)):
    project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
    worker = db.query(WorkerDB).filter(WorkerDB.id == request.worker_id).first()
    if not project or not worker:
        raise HTTPException(status_code=404, detail="Project or Worker not found")
    worker.assigned_project_id = project_id
    db.commit()
    return {"message": f"Worker {worker.name} assigned to project {project.name}"}

# ---------- CLOCK ----------
@app.post("/clockin/")
def clock_in(request: ClockInRequest, db: Session = Depends(get_db)):
    worker = db.query(WorkerDB).filter(WorkerDB.id == request.worker_id).first()
    project = db.query(ProjectDB).filter(ProjectDB.id == request.project_id).first()
    if not worker or not project:
        raise HTTPException(status_code=404, detail="Worker or Project not found")
    
    active = db.query(ClockEntryDB).filter(ClockEntryDB.worker_id == worker.id, ClockEntryDB.clock_out_time == None).first()
    if active:
        raise HTTPException(status_code=400, detail=f"Worker already clocked in on project {active.project_id}")

    if request.timestamp:
        ts_str = request.timestamp.replace("Z", "+00:00")
        clock_in_time = datetime.fromisoformat(ts_str)
    else:
        clock_in_time = datetime.now(ist)

    entry = ClockEntryDB(worker_id=worker.id, project_id=project.id, clock_in_time=clock_in_time)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@app.post("/clockout/")
def clock_out(request: ClockOutRequest, db: Session = Depends(get_db)):
    entry = db.query(ClockEntryDB).filter(
        ClockEntryDB.worker_id == request.worker_id,
        ClockEntryDB.project_id == request.project_id,
        ClockEntryDB.clock_out_time == None
    ).order_by(ClockEntryDB.id.desc()).first()
    
    if not entry:
        raise HTTPException(status_code=400, detail="No active clock-in found for this worker on this project")

    if request.timestamp:
        ts_str = request.timestamp.replace("Z", "+00:00")
        clock_out_time = datetime.fromisoformat(ts_str)
    else:
        clock_out_time = datetime.now(ist)

    clock_in_time = entry.clock_in_time
    if clock_in_time.tzinfo is None:
        clock_in_time = ist.localize(clock_in_time)
    if clock_out_time.tzinfo is None:
        clock_out_time = ist.localize(clock_out_time)

    entry.clock_out_time = clock_out_time
    entry.total_hours = round((clock_out_time - clock_in_time).total_seconds() / 3600, 2)
    db.commit()
    db.refresh(entry)
    return entry

@app.get("/clock_entries/", response_model=List[ClockEntryResponse])
def get_clock_entries(worker_id: Optional[int] = None, project_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(ClockEntryDB)
    if worker_id:
        query = query.filter(ClockEntryDB.worker_id == worker_id)
    if project_id:
        query = query.filter(ClockEntryDB.project_id == project_id)
    
    entries_from_db = query.order_by(ClockEntryDB.clock_in_time.desc()).all()
    
    response = []
    for entry in entries_from_db:
        response.append({
            "id": entry.id,
            "worker_id": entry.worker_id,
            "project_id": entry.project_id,
            "worker_name": entry.worker.name,
            "project_name": entry.project.name,
            "clock_in_time": entry.clock_in_time,
            "clock_out_time": entry.clock_out_time,
            "total_hours": entry.total_hours
        })
    return response

# ---------- CHATBOT ----------
@app.post("/chatbot")
def chatbot(request: ChatRequest, db: Session = Depends(get_db)):
    q = request.query.lower().strip()
    response = ""

    worker = db.query(WorkerDB).filter(WorkerDB.name.ilike(f"%{q}%")).first()
    project = db.query(ProjectDB).filter(ProjectDB.name.ilike(f"%{q}%")).first()

    if worker:
        response += f"👷 Worker: {worker.name} (Role: {worker.role})\n"
        if worker.project:
            response += f"Assigned Project: {worker.project.name}\n"
        entries = db.query(ClockEntryDB).filter(ClockEntryDB.worker_id == worker.id).all()
        if entries:
            response += "Clock Entries:\n"
            for e in entries:
                proj_name = db.query(ProjectDB).filter(ProjectDB.id == e.project_id).first().name
                response += f"- Project {proj_name}: In {e.clock_in_time.strftime('%Y-%m-%d %H:%M')}, Out {e.clock_out_time.strftime('%Y-%m-%d %H:%M') if e.clock_out_time else 'In progress'}\n"
        else:
            response += "No clock entries yet.\n"
    elif project:
        response += f"📁 Project: {project.name}\n"
        workers = db.query(WorkerDB).filter(WorkerDB.assigned_project_id == project.id).all()
        if workers:
            response += "Workers:\n"
            for w in workers:
                response += f"- {w.name} ({w.role})\n"
        else:
            response += "No workers assigned.\n"
    else:
        response = "❓ No worker or project found matching query."

    return {"response": response}