from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import pytz
from sqlalchemy.ext.declarative import declarative_base


from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import sessionmaker, relationship, Session, joinedload

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
    # FIX: Added relationship for fetching project_name in clock entries
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
    # FIX: Added relationship for fetching project_name
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

class ClockRequest(BaseModel):
    worker_id: int
    project_id: int
    timestamp: Optional[str] = None

# A single response model for clock entries that includes names
class ClockEntryResponse(BaseModel):
    id: int
    worker_id: int
    project_id: int
    worker_name: str
    project_name: str
    clock_in_time: datetime
    clock_out_time: Optional[datetime] = None
    total_hours: Optional[float] = None
    class Config:
        orm_mode = True

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

def seed_users():
    db = SessionLocal()
    if db.query(UserDB).count() == 0:
        db.add_all([
            UserDB(username="manager1", password="manager123", role="Manager"),
            UserDB(username="supervisor1", password="supervisor123", role="Supervisor"),
            UserDB(username="worker1", password="worker123", role="Worker"),
        ])
        db.commit()
    db.close()
seed_users()

# -------------------------------
# ROUTES
# -------------------------------
@app.get("/")
def root():
    return {"message": "Backend running successfully"}

# (Unchanged Login, Projects, Workers routes)
@app.post("/login", response_model=User)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.username == request.username, UserDB.password == request.password).first()
    if not user: raise HTTPException(status_code=401, detail="Invalid credentials")
    return user
@app.post("/projects/", response_model=Project)
def create_project(project: ProjectBase, db: Session = Depends(get_db)):
    db_project = ProjectDB(**project.dict())
    db.add(db_project); db.commit(); db.refresh(db_project)
    return db_project
@app.get("/projects/", response_model=List[Project])
def get_projects(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(ProjectDB)
    if status: query = query.filter(ProjectDB.status.ilike(status))
    return query.all()
@app.post("/workers/", response_model=Worker)
def create_worker(worker: WorkerBase, db: Session = Depends(get_db)):
    db_worker = WorkerDB(**worker.dict())
    db.add(db_worker); db.commit(); db.refresh(db_worker)
    return db_worker
@app.get("/workers/", response_model=List[Worker])
def get_workers(project_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(WorkerDB)
    if project_id: query = query.filter(WorkerDB.assigned_project_id == project_id)
    return query.all()
@app.post("/projects/{project_id}/assign")
def assign_worker(project_id: int, request: AssignRequest, db: Session = Depends(get_db)):
    project = db.query(ProjectDB).get(project_id)
    worker = db.query(WorkerDB).get(request.worker_id)
    if not project or not worker: raise HTTPException(status_code=404, detail="Project or Worker not found")
    worker.assigned_project_id = project_id
    db.commit()
    return {"message": f"Worker {worker.name} assigned to project {project.name}"}

# ---------- CLOCK ----------
@app.post("/clockin/", response_model=ClockEntryResponse)
def clock_in(request: ClockRequest, db: Session = Depends(get_db)):
    worker = db.query(WorkerDB).get(request.worker_id)
    project = db.query(ProjectDB).get(request.project_id)
    if not worker or not project:
        raise HTTPException(status_code=404, detail="Worker or Project not found")
    
    # FIX: Correctly check if worker is active on ANY project
    active = db.query(ClockEntryDB).filter(
        ClockEntryDB.worker_id == worker.id, 
        ClockEntryDB.clock_out_time == None
    ).first()
    if active:
        raise HTTPException(status_code=400, detail=f"Worker already clocked in on another project.")

    ts = datetime.fromisoformat(request.timestamp.replace("Z", "+00:00")) if request.timestamp else datetime.now(ist)
    entry = ClockEntryDB(worker_id=worker.id, project_id=project.id, clock_in_time=ts)
    db.add(entry); db.commit(); db.refresh(entry)
    
    return ClockEntryResponse(
        id=entry.id, worker_id=entry.worker_id, project_id=entry.project_id,
        worker_name=entry.worker.name, project_name=entry.project.name,
        clock_in_time=entry.clock_in_time, clock_out_time=entry.clock_out_time, total_hours=entry.total_hours
    )

@app.post("/clockout/", response_model=ClockEntryResponse)
def clock_out(request: ClockRequest, db: Session = Depends(get_db)):
    # FIX: Correctly find the active entry for the specific worker (project doesn't matter for finding active session)
    entry = db.query(ClockEntryDB).filter(
        ClockEntryDB.worker_id == request.worker_id,
        ClockEntryDB.clock_out_time == None
    ).order_by(ClockEntryDB.id.desc()).first()
    
    if not entry:
        raise HTTPException(status_code=400, detail="No active clock-in found for this worker")

    ts = datetime.fromisoformat(request.timestamp.replace("Z", "+00:00")) if request.timestamp else datetime.now(ist)
    
    clock_in_time = entry.clock_in_time.astimezone(ist) if entry.clock_in_time.tzinfo is None else entry.clock_in_time
    clock_out_time = ts.astimezone(ist) if ts.tzinfo is None else ts

    entry.clock_out_time = clock_out_time
    entry.total_hours = round((clock_out_time - clock_in_time).total_seconds() / 3600, 2)
    db.commit(); db.refresh(entry)

    return ClockEntryResponse(
        id=entry.id, worker_id=entry.worker_id, project_id=entry.project_id,
        worker_name=entry.worker.name, project_name=entry.project.name,
        clock_in_time=entry.clock_in_time, clock_out_time=entry.clock_out_time, total_hours=entry.total_hours
    )

@app.get("/clock_entries/", response_model=List[ClockEntryResponse])
def get_clock_entries(db: Session = Depends(get_db)):
    entries = db.query(ClockEntryDB).options(
        joinedload(ClockEntryDB.worker), 
        joinedload(ClockEntryDB.project)
    ).order_by(ClockEntryDB.clock_in_time.desc()).all()
    
    return [
        ClockEntryResponse(
            id=e.id, worker_id=e.worker_id, project_id=e.project_id,
            worker_name=e.worker.name, project_name=e.project.name,
            clock_in_time=e.clock_in_time, clock_out_time=e.clock_out_time, total_hours=e.total_hours
        ) for e in entries
    ]

# (Unchanged Chatbot route)
@app.post("/chatbot")
def chatbot(request: ChatRequest, db: Session = Depends(get_db)):
    q = request.query.lower().strip()
    response = ""
    worker = db.query(WorkerDB).filter(WorkerDB.name.ilike(f"%{q}%")).first()
    project = db.query(ProjectDB).filter(ProjectDB.name.ilike(f"%{q}%")).first()
    if worker:
        response += f"👷 Worker: {worker.name} (Role: {worker.role})\n"
        if worker.project: response += f"Assigned Project: {worker.project.name}\n"
        entries = db.query(ClockEntryDB).filter(ClockEntryDB.worker_id == worker.id).all()
        if entries:
            response += "Clock Entries:\n"
            for e in entries:
                response += f"- Project {e.project.name}: In {e.clock_in_time.strftime('%Y-%m-%d %H:%M')}, Out {e.clock_out_time.strftime('%Y-%m-%d %H:%M') if e.clock_out_time else 'In progress'}\n"
        else: response += "No clock entries yet.\n"
    elif project:
        response += f"📁 Project: {project.name}\n"
        workers = db.query(WorkerDB).filter(WorkerDB.assigned_project_id == project.id).all()
        if workers:
            response += "Workers:\n"
            for w in workers: response += f"- {w.name} ({w.role})\n"
        else: response += "No workers assigned.\n"
    else: response = "❓ No worker or project found matching query."
    return {"response": response}