from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
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

class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String) 
    role = Column(String)

# --- NEW QUERY MODEL ---
class QueryDB(Base):
    __tablename__ = "queries"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    worker_name = Column(String)
    project_name = Column(String)
    priority = Column(String, default="medium")
    status = Column(String, default="open")
    created_at = Column(DateTime, default=lambda: datetime.now(ist))


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
    timestamp: Optional[datetime] = None

class ClockOutRequest(BaseModel):
    worker_id: int
    project_id: int
    timestamp: Optional[datetime] = None

class ClockEntry(BaseModel):
    id: int
    worker_id: int
    project_id: int
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

# --- NEW QUERY PYDANTIC MODELS ---
class QueryBase(BaseModel):
    title: str
    description: str
    worker_name: str
    project_name: str
    priority: str

class Query(QueryBase):
    id: int
    status: str
    created_at: datetime
    class Config:
        orm_mode = True

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

@app.post("/login", response_model=User)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.username == request.username, UserDB.password == request.password).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return user

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

@app.post("/clockin/", response_model=ClockEntry)
def clock_in(request: ClockInRequest, db: Session = Depends(get_db)):
    worker = db.query(WorkerDB).filter(WorkerDB.id == request.worker_id).first()
    project = db.query(ProjectDB).filter(ProjectDB.id == request.project_id).first()
    if not worker or not project:
        raise HTTPException(status_code=404, detail="Worker or Project not found")
    
    active = db.query(ClockEntryDB).filter(
        ClockEntryDB.worker_id == worker.id,
        ClockEntryDB.clock_out_time == None
    ).first()
    
    if active:
        raise HTTPException(status_code=400, detail=f"Worker already clocked in on Project ID {active.project_id}")

    clock_time = request.timestamp if request.timestamp else datetime.now(ist)
    entry = ClockEntryDB(worker_id=worker.id, project_id=project.id, clock_in_time=clock_time)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@app.post("/clockout/", response_model=ClockEntry)
def clock_out(request: ClockOutRequest, db: Session = Depends(get_db)):
    entry = db.query(ClockEntryDB).filter(
        ClockEntryDB.worker_id == request.worker_id,
        ClockEntryDB.clock_out_time == None
    ).order_by(ClockEntryDB.id.desc()).first()

    if not entry:
        raise HTTPException(status_code=400, detail="No active clock-in found for this worker")

    clock_out_time = request.timestamp if request.timestamp else datetime.now(ist)
    entry.clock_out_time = clock_out_time
    
    # Ensure timezone awareness for calculation
    clock_in_aware = entry.clock_in_time.astimezone(ist) if entry.clock_in_time.tzinfo is None else entry.clock_in_time
    clock_out_aware = clock_out_time.astimezone(ist) if clock_out_time.tzinfo is None else clock_out_time

    entry.total_hours = round((clock_out_aware - clock_in_aware).total_seconds() / 3600, 2)
    db.commit()
    db.refresh(entry)
    return entry

@app.get("/clock_entries/", response_model=List[ClockEntry])
def get_clock_entries(worker_id: Optional[int] = None, project_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(ClockEntryDB)
    if worker_id:
        query = query.filter(ClockEntryDB.worker_id == worker_id)
    if project_id:
        query = query.filter(ClockEntryDB.project_id == project_id)
    return query.all()

# --- NEW QUERIES ENDPOINTS ---
@app.post("/queries/", response_model=Query)
def create_query(query: QueryBase, db: Session = Depends(get_db)):
    new_query = QueryDB(**query.dict())
    db.add(new_query)
    db.commit()
    db.refresh(new_query)
    return new_query

@app.get("/queries/", response_model=List[Query])
def get_queries(db: Session = Depends(get_db)):
    return db.query(QueryDB).order_by(QueryDB.created_at.desc()).all()