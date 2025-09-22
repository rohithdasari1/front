// import { useEffect, useState, useMemo } from "react";
// import {
//   getClockEntries,
//   getWorkers,
//   getProjects,
//   clockIn,
//   clockOut,
//   ensureWorkerAssigned,
// } from "../api";

// // --- INTERFACES ---
// interface ClockEntry {
//   id: number | string;
//   worker_id: number;
//   project_id: number;
//   worker_name: string;
//   project_name: string;
//   clock_in_time: string;
//   clock_out_time?: string | null;
// }
// interface Worker {
//   id: number;
//   name: string;
//   role: string;
// }
// interface Project {
//   id: number;
//   name: string;
// }

// // --- UI HELPER COMPONENTS & ICONS ---
// const StatCard = ({ title, value, icon }: { title: string; value: string | number; icon: JSX.Element; }) => ( <div className="bg-white p-5 rounded-xl shadow-md flex items-center space-x-4 border border-slate-200/80"><div className="bg-blue-100 text-blue-600 p-3 rounded-full">{icon}</div><div><p className="text-sm text-slate-500 font-medium">{title}</p><p className="text-2xl font-bold text-slate-800">{value}</p></div></div> );
// const StatusBadge = ({ type }: { type: 'active' }) => (<span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>);
// const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 11a4 4 0 110-5.292" /></svg>;
// const ClipboardListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
// const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
// const SpinnerIcon = () => <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

// // --- MAIN COMPONENT ---
// export default function ClockEntries() {
//   const [entries, setEntries] = useState<ClockEntry[]>([]);
//   const [workers, setWorkers] = useState<Worker[]>([]);
//   const [projects, setProjects] = useState<Project[]>([]);
//   const [selectedProject, setSelectedProject] = useState<number | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
//   const [actionLoading, setActionLoading] = useState<number | null>(null);

//   const showNotification = (message: string, type: 'success' | 'error' = 'success') => { setNotification({ message, type }); setTimeout(() => setNotification(null), 4000); };

//   const loadData = async () => {
//     try {
//       const [entriesData, workersData, projectsData] = await Promise.all([ getClockEntries(), getWorkers(), getProjects() ]);
//       const w = workersData || [];
//       const p = projectsData || [];
//       setWorkers(w);
//       setProjects(p);

//       // --- FIX: This block correctly maps names to the entries ---
//       const enriched = (entriesData || []).map((ent: any) => {
//         const worker = w.find((x: Worker) => x.id === ent.worker_id);
//         const project = p.find((x: Project) => x.id === ent.project_id);
//         return { 
//             ...ent, 
//             worker_name: ent.worker_name || (worker ? worker.name : `ID: ${ent.worker_id}`), 
//             project_name: ent.project_name || (project ? project.name : `ID: ${ent.project_id}`) 
//         };
//       });
//       setEntries(enriched);
//       // --- END OF FIX ---

//     } catch (err) {
//       setError("Failed to load data. Please check your connection.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadData();
//   }, []);

//   const handleClockAction = async (workerId: number, actionType: 'clockin' | 'clockout') => {
//     if (!selectedProject) {
//       showNotification("Please select a project first.", 'error');
//       return;
//     }
//     setActionLoading(workerId);
//     const ts = new Date().toISOString();
//     try {
//       if (actionType === 'clockin') {
//         await ensureWorkerAssigned(workerId, selectedProject);
//         await clockIn(workerId, selectedProject, ts);
//       } else {
//         await clockOut(workerId, selectedProject, ts);
//       }
//       await loadData(); // Reload data on success
//     } catch (err) {
//       showNotification("Action failed. Please check your internet connection.", "error");
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const { sortedEntries, totalWorkers, totalCheckins, attendanceRate } = useMemo(() => {
//     const sorted = [...entries].sort((a,b) => new Date(b.clock_in_time).getTime() - new Date(a.clock_in_time).getTime());
//     const uniqueCheckedIn = new Set(sorted.map(e => e.worker_id));
//     const rate = workers.length > 0 ? ((uniqueCheckedIn.size / workers.length) * 100).toFixed(1) : "0";
//     return { sortedEntries: sorted, totalWorkers: workers.length, totalCheckins: sorted.length, attendanceRate: rate };
//   }, [entries, workers]);

//   if (loading) return <div className="flex justify-center items-center h-screen bg-slate-100"><p>Loading Dashboard...</p></div>;
//   if (error) return <div className="p-4 text-center text-red-500 bg-red-100 rounded-md">{error}</div>;

//   return (
//     <div className="bg-slate-50 min-h-screen font-sans">
//       <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
//           <div><h1 className="text-3xl font-bold text-slate-800">Time Clock Dashboard</h1><p className="text-slate-500 mt-1">Monitor and manage worker attendance in real-time.</p></div>
//           <div className="flex items-center gap-2 w-full sm:w-auto">
//             <select value={selectedProject ?? ""} onChange={(e) => setSelectedProject(Number(e.target.value) || null)} className="w-full sm:w-48 border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
//               <option value="">Select a Project</option>
//               {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
//             </select>
//           </div>
//         </div>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//           <StatCard title="Total Workers" value={totalWorkers} icon={<UsersIcon />} />
//           <StatCard title="Total Check-ins" value={totalCheckins} icon={<ClipboardListIcon />} />
//           <StatCard title="Attendance Rate" value={`${attendanceRate}%`} icon={<CheckCircleIcon />} />
//         </div>
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md border"><h2 className="text-xl font-bold text-slate-800 mb-4">Worker Actions</h2><div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
//             {workers.map((w) => {
//               const activeEntry = sortedEntries.find((m) => m.worker_id === w.id && !m.clock_out_time);
//               const isActionLoading = actionLoading === w.id;
//               return (
//                 <div key={w.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
//                   <div><p className="font-semibold text-slate-700">{w.name}</p><p className="text-xs text-slate-500">{activeEntry ? <span className="flex items-center gap-1.5"><StatusBadge type="active" /> on {activeEntry.project_name}</span> : 'Available'}</p></div>
//                   <button onClick={() => handleClockAction(w.id, activeEntry ? 'clockout' : 'clockin')} disabled={isActionLoading || !selectedProject} className={`w-28 h-9 inline-flex items-center justify-center text-sm font-semibold text-white rounded-md shadow-sm transition-colors ${activeEntry ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} ${isActionLoading ? 'opacity-70 cursor-wait' : ''} ${!selectedProject ? 'opacity-50 cursor-not-allowed' : ''}`}>{isActionLoading ? <SpinnerIcon /> : (activeEntry ? 'Clock Out' : 'Clock In')}</button>
//                 </div>
//               );
//             })}
//           </div></div>
//           <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border"><h2 className="text-xl font-bold text-slate-800 mb-4">Recent Entries</h2><div className="overflow-x-auto max-h-[60vh]">
//             <table className="w-full text-sm text-left text-slate-500">
//               <thead className="text-xs text-slate-700 uppercase bg-slate-100 sticky top-0"><tr><th scope="col" className="px-6 py-3">Worker</th><th scope="col" className="px-6 py-3">Project</th><th scope="col" className="px-6 py-3">Clock In</th><th scope="col" className="px-6 py-3">Clock Out</th></tr></thead>
//               <tbody>
//                 {sortedEntries.map((e) => (
//                   <tr key={e.id} className="bg-white border-b hover:bg-slate-50">
//                     <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{e.worker_name}</td>
//                     <td className="px-6 py-4">{e.project_name}</td>
//                     <td className="px-6 py-4">{new Date(e.clock_in_time).toLocaleTimeString()}</td>
//                     <td className="px-6 py-4">{e.clock_out_time ? new Date(e.clock_out_time).toLocaleTimeString() : <StatusBadge type="active" />}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div></div>
//         </div>
//         {notification && (<div className={`fixed bottom-5 right-5 px-6 py-3 rounded-lg shadow-xl text-white ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>{notification.message}</div>)}
//       </div>
//     </div>
//   );
// }
import { useEffect, useState, useMemo } from "react";
import {
  getClockEntries,
  getWorkers,
  getProjects,
  clockIn,
  clockOut,
  ensureWorkerAssigned,
} from "../api";

// --- INTERFACES ---
interface ClockEntry {
  id: number | string;
  worker_id: number;
  project_id: number;
  worker_name: string;
  project_name: string;
  clock_in_time: string;
  clock_out_time?: string | null;
  offline?: boolean; // flag for unsynced entries
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

// --- UI HELPERS (unchanged) ---
const StatCard = ({ title, value, icon }: { title: string; value: string | number; icon: JSX.Element; }) => ( <div className="bg-white p-5 rounded-xl shadow-md flex items-center space-x-4 border border-slate-200/80"><div className="bg-blue-100 text-blue-600 p-3 rounded-full">{icon}</div><div><p className="text-sm text-slate-500 font-medium">{title}</p><p className="text-2xl font-bold text-slate-800">{value}</p></div></div> );
const StatusBadge = ({ type }: { type: 'active' }) => (<span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>);
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 11a4 4 0 110-5.292" /></svg>;
const ClipboardListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const SpinnerIcon = () => <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

// --- Local Storage Helpers ---
const OFFLINE_KEY = "offline_clock_queue";
const getOfflineQueue = () => JSON.parse(localStorage.getItem(OFFLINE_KEY) || "[]");
const setOfflineQueue = (q: any) => localStorage.setItem(OFFLINE_KEY, JSON.stringify(q));

// --- MAIN COMPONENT ---
export default function ClockEntries() {
  const [entries, setEntries] = useState<ClockEntry[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => { 
    setNotification({ message, type }); 
    setTimeout(() => setNotification(null), 4000); 
  };

  const loadData = async () => {
    try {
      const [entriesData, workersData, projectsData] = await Promise.all([ getClockEntries(), getWorkers(), getProjects() ]);
      const w = workersData || [];
      const p = projectsData || [];
      setWorkers(w);
      setProjects(p);

      const enriched = (entriesData || []).map((ent: any) => {
        const worker = w.find((x: Worker) => x.id === ent.worker_id);
        const project = p.find((x: Project) => x.id === ent.project_id);
        return { 
            ...ent, 
            worker_name: ent.worker_name || (worker ? worker.name : `ID: ${ent.worker_id}`), 
            project_name: ent.project_name || (project ? project.name : `ID: ${ent.project_id}`) 
        };
      });

      // merge offline entries
      const offline = getOfflineQueue().map((e: any) => ({ ...e, offline: true }));
      setEntries([...offline, ...enriched]);

    } catch (err) {
      setError("Failed to load data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener("online", loadData);
    return () => window.removeEventListener("online", loadData);
  }, []);

  const handleClockAction = async (workerId: number, actionType: 'clockin' | 'clockout') => {
    if (!selectedProject) {
      showNotification("Please select a project first.", 'error');
      return;
    }
    setActionLoading(workerId);
    const ts = new Date().toISOString();

    if (!navigator.onLine) {
      // offline → save to localStorage
      const queue = getOfflineQueue();
      queue.push({ worker_id: workerId, project_id: selectedProject, type: actionType, timestamp: ts, id: `offline-${Date.now()}` });
      setOfflineQueue(queue);
      showNotification("Saved offline. Waiting to sync.", "success");
      await loadData();
      setActionLoading(null);
      return;
    }

    try {
      if (actionType === 'clockin') {
        await ensureWorkerAssigned(workerId, selectedProject);
        await clockIn(workerId, selectedProject, ts);
      } else {
        await clockOut(workerId, selectedProject, ts);
      }
      await loadData();
    } catch (err) {
      showNotification("Action failed. Please check your internet connection.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSync = async () => {
    const queue = getOfflineQueue();
    if (queue.length === 0) {
      showNotification("No offline entries to sync.", "error");
      return;
    }
    try {
      for (const q of queue) {
        if (q.type === "clockin") {
          await ensureWorkerAssigned(q.worker_id, q.project_id);
          await clockIn(q.worker_id, q.project_id, q.timestamp);
        } else {
          await clockOut(q.worker_id, q.project_id, q.timestamp);
        }
      }
      setOfflineQueue([]);
      showNotification("Offline entries synced successfully.", "success");
      await loadData();
    } catch (err) {
      showNotification("Sync failed. Try again.", "error");
    }
  };

  const { sortedEntries, totalWorkers, totalCheckins, attendanceRate } = useMemo(() => {
    const sorted = [...entries].sort((a,b) => new Date(b.clock_in_time).getTime() - new Date(a.clock_in_time).getTime());
    const uniqueCheckedIn = new Set(sorted.map(e => e.worker_id));
    const rate = workers.length > 0 ? ((uniqueCheckedIn.size / workers.length) * 100).toFixed(1) : "0";
    return { sortedEntries: sorted, totalWorkers: workers.length, totalCheckins: sorted.length, attendanceRate: rate };
  }, [entries, workers]);

  if (loading) return <div className="flex justify-center items-center h-screen bg-slate-100"><p>Loading Dashboard...</p></div>;
  if (error) return <div className="p-4 text-center text-red-500 bg-red-100 rounded-md">{error}</div>;

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Time Clock Dashboard</h1>
            <p className="text-slate-500 mt-1">Monitor and manage worker attendance in real-time.</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select value={selectedProject ?? ""} onChange={(e) => setSelectedProject(Number(e.target.value) || null)} className="w-full sm:w-48 border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
              <option value="">Select a Project</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button onClick={handleSync} className="px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600">Sync Now</button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Workers" value={totalWorkers} icon={<UsersIcon />} />
          <StatCard title="Total Check-ins" value={totalCheckins} icon={<ClipboardListIcon />} />
          <StatCard title="Attendance Rate" value={`${attendanceRate}%`} icon={<CheckCircleIcon />} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md border">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Worker Actions</h2>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {workers.map((w) => {
                const activeEntry = sortedEntries.find((m) => m.worker_id === w.id && !m.clock_out_time);
                const isActionLoading = actionLoading === w.id;
                return (
                  <div key={w.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-700">{w.name}</p>
                      <p className="text-xs text-slate-500">
                        {activeEntry ? <span className="flex items-center gap-1.5">{activeEntry.offline ? "⏳ Waiting to Sync" : <StatusBadge type="active" />} on {activeEntry.project_name}</span> : 'Available'}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleClockAction(w.id, activeEntry ? 'clockout' : 'clockin')} 
                      disabled={isActionLoading || !selectedProject} 
                      className={`w-28 h-9 inline-flex items-center justify-center text-sm font-semibold text-white rounded-md shadow-sm transition-colors ${activeEntry ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} ${isActionLoading ? 'opacity-70 cursor-wait' : ''} ${!selectedProject ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isActionLoading ? <SpinnerIcon /> : (activeEntry ? 'Clock Out' : 'Clock In')}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Entries</h2>
            <div className="overflow-x-auto max-h-[60vh]">
              <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-100 sticky top-0">
                  <tr>
                    <th className="px-6 py-3">Worker</th>
                    <th className="px-6 py-3">Project</th>
                    <th className="px-6 py-3">Clock In</th>
                    <th className="px-6 py-3">Clock Out</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEntries.map((e) => (
                    <tr key={e.id} className="bg-white border-b hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{e.worker_name}</td>
                      <td className="px-6 py-4">{e.project_name}</td>
                      <td className="px-6 py-4">{new Date(e.clock_in_time).toLocaleTimeString()}</td>
                      <td className="px-6 py-4">{e.clock_out_time ? new Date(e.clock_out_time).toLocaleTimeString() : (e.offline ? "⏳ Waiting to Sync" : <StatusBadge type="active" />)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {notification && (<div className={`fixed bottom-5 right-5 px-6 py-3 rounded-lg shadow-xl text-white ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>{notification.message}</div>)}
      </div>
    </div>
  );
}
