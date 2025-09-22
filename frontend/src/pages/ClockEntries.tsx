import { useEffect, useState } from "react";
import {
  getClockEntries,
  getWorkers,
  getProjects,
  clockIn,
  clockOut,
  ensureWorkerAssigned,
} from "../api";

interface ClockEntry {
  id: number;
  worker_id: number;
  project_id: number;
  worker_name: string;
  project_name: string;
  clock_in_time: string;
  clock_out_time?: string | null;
}

interface Worker {
  id: number;
  name: string;
  role: string;
}

interface Project {
  id: number;
  name: string;
}

export default function ClockEntries() {
  const [entries, setEntries] = useState<ClockEntry[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [e, w, p] = await Promise.all([
        getClockEntries(),
        getWorkers(),
        getProjects(),
      ]);
      setEntries(e);
      setWorkers(w);
      setProjects(p);
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClockIn = async (workerId: number) => {
    if (!selectedProject) {
      alert("Please select a project first!");
      return;
    }
    try {
      // Make sure worker is assigned to project
      await ensureWorkerAssigned(workerId, selectedProject);
      await clockIn(workerId, selectedProject);
      await loadData();
    } catch (err: any) {
      alert("Clock-in failed: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleClockOut = async (workerId: number) => {
    if (!selectedProject) {
      alert("Please select a project first!");
      return;
    }
    try {
      await clockOut(workerId, selectedProject);
      await loadData();
    } catch (err: any) {
      alert("Clock-out failed: " + (err.response?.data?.detail || err.message));
    }
  };

  // ---- Stats ----
  const totalWorkers = workers.length;
  const totalCheckins = entries.length;
  const completed = entries.filter((e) => e.clock_out_time).length;
  const attendanceRate =
    totalWorkers > 0 ? ((completed / totalWorkers) * 100).toFixed(1) : "0";

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">Clock Entries</h1>

      {/* Project Selector */}
      <div className="mb-4">
        <label className="mr-2">Select Project:</label>
        <select
          value={selectedProject ?? ""}
          onChange={(e) => setSelectedProject(Number(e.target.value))}
          className="border px-2 py-1"
        >
          <option value="">-- choose --</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="flex gap-6">
        <div>Total Workers: {totalWorkers}</div>
        <div>Total Check-ins: {totalCheckins}</div>
        <div>Attendance Rate: {attendanceRate}%</div>
      </div>

      {/* Workers Table */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Worker</th>
            <th className="border px-2 py-1">Action</th>
          </tr>
        </thead>
        <tbody>
          {workers.map((w) => {
            const active = entries.find(
              (e) => e.worker_id === w.id && !e.clock_out_time
            );
            return (
              <tr key={w.id}>
                <td className="border px-2 py-1">{w.name}</td>
                <td className="border px-2 py-1">
                  {active ? (
                    <button
                      onClick={() => handleClockOut(w.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                    >
                      Clock Out
                    </button>
                  ) : (
                    <button
                      onClick={() => handleClockIn(w.id)}
                      className="px-2 py-1 bg-green-500 text-white rounded"
                    >
                      Clock In
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Recent Entries */}
      <h2 className="text-lg font-semibold mt-6">Recent Entries</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Worker</th>
            <th className="border px-2 py-1">Project</th>
            <th className="border px-2 py-1">Check In</th>
            <th className="border px-2 py-1">Check Out</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id}>
              <td className="border px-2 py-1">{e.worker_name}</td>
              <td className="border px-2 py-1">{e.project_name}</td>
              <td className="border px-2 py-1">
                {new Date(e.clock_in_time).toLocaleTimeString()}
              </td>
              <td className="border px-2 py-1">
                {e.clock_out_time
                  ? new Date(e.clock_out_time).toLocaleTimeString()
                  : "In Progress"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
