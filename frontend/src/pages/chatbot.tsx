import { useEffect, useState } from "react";
import { getWorkers, getProjects, getClockEntries } from "../api";

interface Worker {
  id: number;
  name: string;
  role: string;
  assigned_project_id?: number;
}

interface Project {
  id: number;
  name: string;
}

interface ClockEntry {
  id: number;
  worker_id: number;
  project_id: number;
  worker_name: string;
  project_name: string;
  clock_in_time: string;
  clock_out_time?: string | null;
}

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
}

export default function Chatbot() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [entries, setEntries] = useState<ClockEntry[]>([]);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    Promise.all([getWorkers(), getProjects(), getClockEntries()]).then(
      ([w, p, e]) => {
        setWorkers(w);
        setProjects(p);
        setEntries(e);
      }
    );
  }, []);

  const handleQuery = () => {
    if (!query.trim()) return;

    const q = query.toLowerCase();

    // Match worker
    const worker = workers.find((w) => w.name.toLowerCase() === q);

    // Match project
    const project = projects.find((p) => p.name.toLowerCase() === q);

    // Match worker + project if both appear in query
    const matchedWorker = workers.find((w) =>
      q.includes(w.name.toLowerCase())
    );
    const matchedProject = projects.find((p) =>
      q.includes(p.name.toLowerCase())
    );

    let output = "";

    if (worker) {
      output += `👷 Worker: ${worker.name}\nRole: ${worker.role}\n`;

      const workerEntries = entries.filter((e) => e.worker_id === worker.id);

      if (workerEntries.length > 0) {
        output += `\nTime Entries:\n`;
        workerEntries.forEach((e) => {
          output += `- Project: ${e.project_name}, In: ${new Date(
            e.clock_in_time
          ).toLocaleString()}, Out: ${
            e.clock_out_time
              ? new Date(e.clock_out_time).toLocaleString()
              : "In Progress"
          }\n`;
        });
      } else {
        output += "\nNo time entries yet.\n";
      }
    } else if (project) {
      output += `📁 Project: ${project.name}\n`;

      const projectEntries = entries.filter((e) => e.project_id === project.id);

      if (projectEntries.length > 0) {
        output += `\nWorkers in this project:\n`;
        projectEntries.forEach((e) => {
          output += `- ${e.worker_name}: In ${new Date(
            e.clock_in_time
          ).toLocaleString()}, Out: ${
            e.clock_out_time
              ? new Date(e.clock_out_time).toLocaleString()
              : "In Progress"
          }\n`;
        });
      } else {
        output += "\nNo workers have clocked in yet.\n";
      }
    } else if (matchedWorker && matchedProject) {
      output += `🔍 Worker ${matchedWorker.name} in Project ${matchedProject.name}\n`;

      const wpEntries = entries.filter(
        (e) =>
          e.worker_id === matchedWorker.id &&
          e.project_id === matchedProject.id
      );

      if (wpEntries.length > 0) {
        wpEntries.forEach((e) => {
          output += `- In: ${new Date(e.clock_in_time).toLocaleString()}, Out: ${
            e.clock_out_time
              ? new Date(e.clock_out_time).toLocaleString()
              : "In Progress"
          }\n`;
        });
      } else {
        output += "No entries yet.\n";
      }
    } else {
      output = "❓ No matching worker or project found.";
    }

    // Add messages to UI
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: query },
      { sender: "bot", text: output },
    ]);
    setQuery("");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Rule-based Chatbot</h1>

      {/* Chat Window */}
      <div className="h-96 overflow-y-auto border rounded-lg p-4 bg-white shadow-md">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-3 flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-xs whitespace-pre-wrap ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-900 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input box */}
      <div className="mt-4 flex">
        <input
          type="text"
          placeholder="Type worker or project name..."
          className="border px-3 py-2 flex-1 rounded-lg"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleQuery()}
        />
        <button
          onClick={handleQuery}
          className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow"
        >
          Ask
        </button>
      </div>
    </div>
  );
}
