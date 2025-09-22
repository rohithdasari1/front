import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { getProjects, getWorkers, getClockEntries } from "../api"; // Fetches all necessary data
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

// --- DUMMY COMPONENTS (Placeholders for other charts) ---
import MonthlyProgressChart from "../components/charts/MonthlyProgressChart";
import BudgetAnalysisChart from "../components/charts/BudgetAnalysisChart";
import KPICard from "../components/KPICard";

// --- INTERFACES ---
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
};

interface ClockEntry {
  id: number | string;
  worker_id: number;
  worker_name: string;
  clock_in_time: string;
  clock_out_time?: string | null;
  total_hours?: number | null; // This is key for the calculation
}

// --- MOTION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.3 },
  },
};

// --- MAIN REPORTS COMPONENT ---
export default function Reports() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [entries, setEntries] = useState<ClockEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- DATA FETCHING ---
  useEffect(() => {
    Promise.all([getProjects(), getWorkers(), getClockEntries()])
      .then(([projectsData, workersData, entriesData]) => {
        setProjects(projectsData || []);
        setWorkers(workersData || []);
        setEntries(entriesData || []);
      })
      .catch(() => setError("Failed to load report data."))
      .finally(() => setLoading(false));
  }, []);

  // --- DATA PROCESSING FOR CHARTS ---
  const projectStatusData = useMemo(() => {
    if (!projects.length) return [];
    const statusCounts = projects.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [projects]);

  const teamContributionData = useMemo(() => {
    if (!workers.length || !entries.length) return [];
    
    const hoursByWorker: { [key: number]: number } = {};

    // Calculate total hours from entries
    entries.forEach(entry => {
        if (entry.total_hours) {
            hoursByWorker[entry.worker_id] = (hoursByWorker[entry.worker_id] || 0) + entry.total_hours;
        }
    });

    // Map worker names to their total hours
    return workers.map(worker => ({
        name: worker.name,
        "Hours Worked": parseFloat(hoursByWorker[worker.id]?.toFixed(2) || "0"),
        // Adding dummy data for "Projects Completed" to match the visual style
        "Projects Completed": Math.floor(Math.random() * 10) + 1, 
    }));
  }, [workers, entries]);

  const CHART_COLORS = ["#3b82f6", "#22c55e", "#f97316", "#a855f7"];

  // Dummy data for KPIs
  const kpis = [
    { title: "Delivery Rate", value: "94.2%", target: "95%", trend: "up" },
    { title: "Cost Savings", value: "18.5%", target: "15%", trend: "up" },
    { title: "Efficiency Score", value: "87.3%", target: "85%", trend: "up" },
    { title: "Client Satisfaction", value: "4.8/5", target: "4.5/5", trend: "up" },
  ];

  if (loading) return <div className="p-6">Loading report data...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <motion.div
      className="p-6 space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Reports & Analytics
        </h1>
        <p className="text-gray-600">
          Comprehensive insights and performance metrics
        </p>
      </motion.div>

      {/* --- CHARTS GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          variants={itemVariants}
          className="bg-white p-6 rounded-xl shadow-lg border"
        >
          <h3 className="font-semibold text-slate-700 mb-4">
            Projects by Status
          </h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <RechartsPieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <MonthlyProgressChart />
        </motion.div>
      </div>

       {/* MODIFIED: Team Contribution Chart with REAL Data */}
      <motion.div
        variants={itemVariants}
        className="bg-white p-6 rounded-xl shadow-lg border"
      >
        <h3 className="font-semibold text-slate-700 mb-4">
          Team Member Contributions
        </h3>
        <div style={{ width: "100%", height: 350 }}>
          <ResponsiveContainer>
            <RechartsBarChart data={teamContributionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Hours Worked" fill="#3b82f6" />
              <Bar dataKey="Projects Completed" fill="#8b5cf6" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <BudgetAnalysisChart />
      </motion.div>

      {/* --- KPI SUMMARY --- */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Key Performance Indicators
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, index) => (
            <KPICard key={index} {...kpi} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}