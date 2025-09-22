import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { FolderKanban, Target, TrendingUp, Users, Clock, LogIn, LogOut, BarChartHorizontal } from "lucide-react";
import { getProjects, getWorkers, getClockEntries } from "../api";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// --- INTERFACES ---
interface Project { id: number; name: string; status: string; }
interface Worker { id: number; name: string; role: string; }
interface ClockEntry { id: number; worker_id: number; project_id: number; clock_in_time: string; clock_out_time?: string | null; }

// --- UI HELPER COMPONENTS ---
const StatCard = ({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ElementType }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/60 flex items-center space-x-4">
        <div className="bg-blue-100 text-blue-600 p-3 rounded-full"><Icon size={24} /></div>
        <div><p className="text-sm font-medium text-slate-500">{title}</p><p className="text-2xl font-bold text-slate-800">{value}</p></div>
    </div>
);

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 }}};
const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 }};

// --- MAIN DASHBOARD COMPONENT ---
export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [entries, setEntries] = useState<ClockEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [projectsData, workersData, entriesData] = await Promise.all([ getProjects(), getWorkers(), getClockEntries() ]);
        setProjects(projectsData || []);
        setWorkers(workersData || []);
        setEntries(entriesData || []);
      } catch (err) { console.error("Failed to load dashboard data:", err); }
      finally { setLoading(false); }
    }
    fetchData();
  }, []);
  
  // --- Process data for all dashboard modules ---
  const dashboardData = useMemo(() => {
    // Stat cards
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === "Active").length;
    const totalWorkers = workers.length;
    const onlineWorkers = entries.filter(e => !e.clock_out_time);
    
    // Recent Activity Feed
    const recentActivities = entries
      .sort((a, b) => new Date(b.clock_in_time).getTime() - new Date(a.clock_in_time).getTime())
      .slice(0, 5)
      .map(entry => {
          const worker = workers.find(w => w.id === entry.worker_id);
          const project = projects.find(p => p.id === entry.project_id);
          return {
              id: entry.id,
              workerName: worker?.name || 'Unknown',
              projectName: project?.name || 'Unknown',
              time: entry.clock_out_time || entry.clock_in_time,
              type: entry.clock_out_time ? 'clock_out' : 'clock_in'
          };
      });

    // "Who's Online?" list
    const onlineWorkerDetails = onlineWorkers.map(entry => {
        const worker = workers.find(w => w.id === entry.worker_id);
        const project = projects.find(p => p.id === entry.project_id);
        return {
            id: worker?.id,
            name: worker?.name || 'Unknown',
            role: worker?.role || 'Unknown',
            projectName: project?.name || 'Unknown',
            avatar: `https://i.pravatar.cc/150?u=${worker?.id}`
        };
    });

    // Projects Overview Table
    const projectsForTable = projects
      .filter(p => p.status === 'Active')
      .map(p => ({
          ...p,
          teamSize: workers.filter(w => w.assigned_project_id === p.id).length,
          progress: Math.floor(Math.random() * 70) + 20 // Mock progress
      }));

    // Activity Chart Data
    const activityByDay = entries.reduce((acc, entry) => {
        const date = new Date(entry.clock_in_time).toLocaleDateString('en-US', { weekday: 'short' });
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {} as {[key: string]: number});
    const activityChartData = Object.entries(activityByDay).map(([name, clockIns]) => ({name, clockIns})).slice(-7);

    return { totalProjects, activeProjects, totalWorkers, activeWorkersCount: onlineWorkers.length, recentActivities, onlineWorkerDetails, projectsForTable, activityChartData };
  }, [projects, workers, entries]);

  if (loading) return <div className="flex justify-center items-center h-screen"><p>Loading Dashboard...</p></div>;

  return (
    <motion.div className="p-6 space-y-8 bg-slate-100 min-h-screen" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold text-slate-800 mb-2">Dashboard</h1>
        <p className="text-slate-500">Welcome back! Here's a real-time overview of your projects.</p>
      </motion.div>

      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" variants={itemVariants}>
        <StatCard title="Total Projects" value={dashboardData.totalProjects} icon={FolderKanban} />
        <StatCard title="Active Projects" value={dashboardData.activeProjects} icon={Target} />
        <StatCard title="Team Members" value={dashboardData.totalWorkers} icon={Users} />
        <StatCard title="Active Workers" value={dashboardData.activeWorkersCount} icon={TrendingUp} />
      </motion.div>

      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-8" variants={itemVariants}>
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg border"><h3 className="text-xl font-semibold text-slate-700 mb-4 flex items-center gap-2"><BarChartHorizontal/> Activity Last 7 Days</h3><div style={{width: '100%', height: 300}}><ResponsiveContainer><AreaChart data={dashboardData.activityChartData}><XAxis dataKey="name" /><YAxis /><Tooltip /><Area type="monotone" dataKey="clockIns" stroke="#3b82f6" fill="#bfdbfe" /></AreaChart></ResponsiveContainer></div></div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border"><h3 className="text-xl font-semibold text-slate-700 mb-4">Active Projects Overview</h3><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-slate-500"><th className="p-3">Project Name</th><th>Team Size</th><th>Progress</th><th>Status</th></tr></thead><tbody>{dashboardData.projectsForTable.map(p => <tr key={p.id} className="border-t"><td className="p-3 font-semibold">{p.name}</td><td>{p.teamSize}</td><td><div className="w-full bg-slate-200 h-2 rounded-full"><div className="bg-blue-500 h-2 rounded-full" style={{width: `${p.progress}%`}}></div></div></td><td><span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">{p.status}</span></td></tr>)}</tbody></table></div></div>
        </div>
        {/* Right Sidebar Column */}
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg border"><h3 className="text-xl font-semibold text-slate-700 mb-4">Who's Online?</h3><div className="space-y-4">{dashboardData.onlineWorkerDetails.map(w => <div key={w.id} className="flex items-center gap-3"><img src={w.avatar} className="w-10 h-10 rounded-full"/><div className="text-sm"><p className="font-semibold text-slate-700">{w.name}</p><p className="text-slate-500">{w.projectName}</p></div></div>)}</div></div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border"><h3 className="text-xl font-semibold text-slate-700 mb-4">Recent Activity</h3><div className="space-y-4">{dashboardData.recentActivities.map(act => <div key={act.id} className="flex items-center gap-3 text-sm"><div className={`p-2 rounded-full ${act.type === 'clock_in' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{act.type === 'clock_in' ? <LogIn size={16}/> : <LogOut size={16}/>}</div><div><p className="text-slate-600"><span className="font-semibold">{act.workerName}</span> {act.type === 'clock_in' ? 'clocked in to' : 'clocked out from'} <span className="font-semibold">{act.projectName}</span></p><p className="text-xs text-slate-400">{new Date(act.time).toLocaleTimeString()}</p></div></div>)}</div></div>
        </div>
      </motion.div>
    </motion.div>
  );
}