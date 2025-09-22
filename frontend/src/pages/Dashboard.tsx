import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import StatCard from "../components/StatCard";
import FeatureCard from "../components/FeatureCard";
import {
  FolderKanban,
  Users,
  Target,
  TrendingUp,
  BarChart3,
  UserCheck,
  Clock,
} from "lucide-react";
import { getProjects, getWorkers, getClockEntries } from "../api"; // 🔗 backend calls

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

export default function Dashboard() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [projects, workers, entries] = await Promise.all([
          getProjects(),
          getWorkers(),
          getClockEntries(),
        ]);

        const totalProjects = projects.length;
        const activeProjects = projects.filter(
          (p: any) => p.status === "In Progress"
        ).length;
        const totalWorkers = workers.length;

        // Success Rate: completed projects / total
        const completedProjects = projects.filter(
          (p: any) => p.status === "Completed"
        ).length;
        const successRate =
          totalProjects > 0
            ? ((completedProjects / totalProjects) * 100).toFixed(1) + "%"
            : "0%";

        setStats([
          {
            title: "Total Projects",
            value: totalProjects,
            icon: FolderKanban,
            change: "+12%",
            trend: "up",
          },
          {
            title: "Active Projects",
            value: activeProjects,
            icon: Target,
            change: "+8%",
            trend: "up",
          },
          {
            title: "Team Members",
            value: totalWorkers,
            icon: Users,
            change: "+3%",
            trend: "up",
          },
          {
            title: "Success Rate",
            value: successRate,
            icon: TrendingUp,
            change: "+2.1%",
            trend: "up",
          },
        ]);
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const features = [
    {
      title: "Smart Analytics",
      description:
        "Advanced AI-powered insights to optimize your project performance",
      icon: BarChart3,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Team Collaboration",
      description: "Seamless collaboration tools for distributed teams",
      icon: UserCheck,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Time Tracking",
      description: "Precise time tracking with automated reporting",
      icon: Clock,
      gradient: "from-orange-500 to-red-500",
    },
  ];

  return (
    <motion.div
      className="p-6 space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.div className="text-center space-y-6" variants={itemVariants}>
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
          Project Management
          <br />
          Reimagined
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Transform your workflow with intelligent project management tools
          designed for the modern team.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <motion.button
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
            whileHover={{
              scale: 1.1,
              y: -5,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started
          </motion.button>
          <motion.button
            className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
            whileHover={{ scale: 1.1, y: -5, borderColor: "#3B82F6" }}
            whileTap={{ scale: 0.95 }}
          >
            Learn More
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={itemVariants}
      >
        {loading ? (
          <p className="col-span-4 text-center text-gray-500">Loading stats...</p>
        ) : (
          stats.map((stat, index) => <StatCard key={index} {...stat} />)
        )}
      </motion.div>

      {/* Feature Cards */}
      <motion.div variants={itemVariants}>
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Powerful Features for Modern Teams
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
