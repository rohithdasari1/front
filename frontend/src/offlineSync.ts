import axios from "axios";

// Save failed requests locally
function savePendingRequest(type: string, data: any) {
  let pending = JSON.parse(localStorage.getItem("pendingRequests") || "[]");
  pending.push({ type, data });
  localStorage.setItem("pendingRequests", JSON.stringify(pending));
}

// Try to sync pending requests when online
export async function syncPendingRequests() {
  let pending = JSON.parse(localStorage.getItem("pendingRequests") || "[]");

  if (pending.length === 0) return;

  let stillPending: any[] = [];

  for (let req of pending) {
    try {
      if (req.type === "clockin") {
        await axios.post("http://localhost:8000/clockin/", req.data);
      } else if (req.type === "clockout") {
        await axios.post("http://localhost:8000/clockout/", req.data);
      }
    } catch (err) {
      // If fails again, keep it for retry
      stillPending.push(req);
    }
  }

  localStorage.setItem("pendingRequests", JSON.stringify(stillPending));
}

// Call this function instead of direct axios
export async function safeClockIn(workerId: number, projectId: number) {
  const data = { worker_id: workerId, project_id: projectId };
  try {
    await axios.post("http://localhost:8000/clockin/", data);
    console.log("Clock-in saved on server");
  } catch {
    savePendingRequest("clockin", data);
    console.log("Offline → saved clock-in locally");
  }
}

export async function safeClockOut(workerId: number, projectId: number) {
  const data = { worker_id: workerId, project_id: projectId };
  try {
    await axios.post("http://localhost:8000/clockout/", data);
    console.log("Clock-out saved on server");
  } catch {
    savePendingRequest("clockout", data);
    console.log("Offline → saved clock-out locally");
  }
}

// Listen for internet reconnect
window.addEventListener("online", () => {
  console.log("Internet back! Syncing...");
  syncPendingRequests();
});
