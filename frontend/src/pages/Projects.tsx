import { useEffect, useState } from "react";
import { getProjects, createProject, getWorkers, assignWorker } from "../api";

type Project = {
  id: number;
  name: string;
  description?: string;
  status: string;
};

type Worker = {
  id: number;
  name: string;
  role: string;
  assigned_project_id?: number | null;
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New project form state
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newStatus, setNewStatus] = useState("Active");

  // Worker assignment state
  const [selectedWorker, setSelectedWorker] = useState<number | "">("");

  useEffect(() => {
    Promise.all([getProjects(), getWorkers()])
      .then(([projectsData, workersData]) => {
        setProjects(projectsData);
        setWorkers(workersData);
      })
      .catch(() => setError("Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  // Create a new project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newProject = await createProject({
        name: newName,
        description: newDesc,
        status: newStatus,
      });
      setProjects((prev) => [...prev, newProject]);
      setNewName("");
      setNewDesc("");
    } catch {
      setError("Failed to create project");
    }
  };

  // Assign worker to project
  const handleAssignWorker = async (projectId: number) => {
    if (!selectedWorker) return;
    try {
      await assignWorker(projectId, Number(selectedWorker));
      alert(`Worker ${selectedWorker} assigned to project ${projectId}`);
      // refresh workers after assignment
      const updatedWorkers = await getWorkers();
      setWorkers(updatedWorkers);
    } catch {
      setError("Failed to assign worker");
    }
  };

  if (loading) return <p>Loading projects...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Projects</h1>

      {/* Create Project Form */}
      <form onSubmit={handleCreateProject} className="mb-6 p-4 border rounded-lg shadow bg-white">
        <h2 className="text-lg font-semibold mb-2">Create New Project</h2>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Project Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="border px-3 py-2 rounded"
            required
          />
          <textarea
            placeholder="Description"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="border px-3 py-2 rounded"
          />
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Project
          </button>
        </div>
      </form>

      {/* Projects Table */}
      {projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <table className="w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Description</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Assign Worker</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{project.id}</td>
                <td className="border px-4 py-2">{project.name}</td>
                <td className="border px-4 py-2">{project.description || "-"}</td>
                <td className="border px-4 py-2">{project.status}</td>
                <td className="border px-4 py-2">
                  <div className="flex gap-2">
                    <select
                      value={selectedWorker}
                      onChange={(e) => setSelectedWorker(e.target.value ? Number(e.target.value) : "")}
                      className="border px-2 py-1 rounded"
                    >
                      <option value="">Select Worker</option>
                      {workers
                        .filter((w) => !w.assigned_project_id)
                        .map((worker) => (
                          <option key={worker.id} value={worker.id}>
                            {worker.name} ({worker.role})
                          </option>
                        ))}
                    </select>
                    <button
                      onClick={() => handleAssignWorker(project.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Assign
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
