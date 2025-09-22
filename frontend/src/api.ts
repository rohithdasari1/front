import axios from "axios";

const API_BASE = "http://127.0.0.1:8000"; // FastAPI dev server

// ----------------- AUTH -----------------
export const login = async (username: string, password: string) => {
  const res = await axios.post(`${API_BASE}/login`, { username, password });
  return res.data as { id: number; username: string; role: string };
};

// ----------------- PROJECTS -----------------
export const getProjects = async () => {
  const res = await axios.get(`${API_BASE}/projects/`);
  return res.data;
};

export const createProject = async (project: {
  name: string;
  description?: string;
  status?: string;
}) => {
  const res = await axios.post(`${API_BASE}/projects/`, project);
  return res.data;
};

export const assignWorker = async (projectId: number, workerId: number) => {
  const res = await axios.post(`${API_BASE}/projects/${projectId}/assign`, {
    worker_id: workerId,
  });
  return res.data;
};

// ----------------- WORKERS -----------------
export const getWorkers = async () => {
  const res = await axios.get(`${API_BASE}/workers/`);
  return res.data;
};

export const createWorker = async (worker: {
  name: string;
  role: string;
  assigned_project_id?: number;
}) => {
  const res = await axios.post(`${API_BASE}/workers/`, worker);
  return res.data;
};

// ----------------- CLOCK ENTRIES -----------------
export const getClockEntries = async () => {
  const res = await axios.get(`${API_BASE}/clock_entries/`);
  return res.data;
};

export const clockIn = async (workerId: number, projectId: number) => {
  const res = await axios.post(`${API_BASE}/clockin/`, {
    worker_id: workerId,
    project_id: projectId,
  });
  return res.data;
};

export const clockOut = async (workerId: number, projectId: number) => {
  const res = await axios.post(`${API_BASE}/clockout/`, {
    worker_id: workerId,
    project_id: projectId,
  });
  return res.data;
};

// ----------------- CHATBOT -----------------
export const askChatbot = async (query: string) => {
  const res = await axios.post(`${API_BASE}/chatbot`, { query });
  return res.data as { response: string };
};

// ----------------- HELPERS -----------------
export const ensureWorkerAssigned = async (
  workerId: number,
  projectId: number
) => {
  try {
    await assignWorker(projectId, workerId);
  } catch (err: any) {
    if (err.response?.status !== 400) {
      throw err;
    }
  }
};
