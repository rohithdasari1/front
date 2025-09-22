import { motion } from 'framer-motion';
import { Calendar, User, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Project {
  name: string;
  manager: string;
  progress: number;
  risk: 'low' | 'medium' | 'high';
  startDate: string;
  endDate: string;
  team: string[];
  status: string;
}

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'from-green-500 to-emerald-500';
    if (progress >= 50) return 'from-yellow-500 to-orange-500';
    return 'from-blue-500 to-cyan-500';
  };

  return (
    <motion.div
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50"
      whileHover={{ scale: 1.03, y: -8, rotateY: 3 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">{project.name}</h3>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <User size={14} />
              <span>{project.manager}</span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(project.risk)}`}>
            {project.risk.toUpperCase()} RISK
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(project.progress)}`}
              initial={{ width: 0 }}
              animate={{ width: `${project.progress}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-gray-400" />
            <div>
              <p className="text-gray-500">Start</p>
              <p className="font-medium">{new Date(project.startDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-gray-400" />
            <div>
              <p className="text-gray-500">End</p>
              <p className="font-medium">{new Date(project.endDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-2">Team Members ({project.team.length})</p>
          <p className="text-sm text-gray-700">{project.team.join(', ')}</p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1">
            <CheckCircle2 size={16} className="text-green-500" />
            <span className="text-sm font-medium text-green-600">{project.status}</span>
          </div>
          <motion.button
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm rounded-lg hover:shadow-lg transition-all duration-200"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            View Details
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}