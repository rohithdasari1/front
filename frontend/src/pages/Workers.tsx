import { useEffect, useState } from "react";
import { getWorkers, createWorker } from "../api";

interface Worker {
  id: number;
  name: string;
  role: string;
  assigned_project_id?: number | null;
}

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  const fetchWorkers = async () => {
    try {
      const data = await getWorkers();
      setWorkers(data || []);
    } catch (err) {
      setError("Failed to load workers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role) return alert("Please fill all fields");

    try {
      const newWorker = await createWorker({ name, role });
      setWorkers((prev) => [...prev, newWorker]); // add new worker to list
      setName("");
      setRole("");
    } catch (err) {
      alert("Failed to create worker");
    }
  };

  if (loading) return <p className="p-4">Loading workers...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Workers</h1>

      {/* Create Worker Form */}
      <form
        onSubmit={handleCreateWorker}
        className="bg-white shadow p-4 rounded-lg space-y-4 max-w-md"
      >
        <h2 className="text-lg font-semibold">Add New Worker</h2>
        <input
          type="text"
          placeholder="Name"
          className="w-full border px-3 py-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Role"
          className="w-full border px-3 py-2 rounded"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Worker
        </button>
      </form>

      {/* Worker List */}
      {workers.length === 0 ? (
        <p>No workers found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workers.map((worker) => (
            <div
              key={worker.id}
              className="p-4 border rounded-lg shadow hover:shadow-lg transition"
            >
              <h2 className="font-semibold text-lg">{worker.name}</h2>
              <p className="text-gray-600">{worker.role}</p>
              {worker.assigned_project_id && (
                <p className="text-sm text-blue-600">
                  Assigned to Project #{worker.assigned_project_id}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
