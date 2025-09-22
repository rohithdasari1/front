import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

const data = [
  { name: 'Sarah J.', hoursWorked: 42, projectsCompleted: 8 },
  { name: 'Alex C.', hoursWorked: 38, projectsCompleted: 6 },
  { name: 'Maria G.', hoursWorked: 45, projectsCompleted: 9 },
  { name: 'David L.', hoursWorked: 35, projectsCompleted: 5 },
  { name: 'Emma B.', hoursWorked: 40, projectsCompleted: 7 },
  { name: 'James T.', hoursWorked: 37, projectsCompleted: 6 },
];

export default function TeamContributionChart() {
  return (
    <motion.div
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Team Member Contributions</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                backdropFilter: 'blur(10px)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            <Bar 
              dataKey="hoursWorked" 
              fill="url(#hoursGradient)" 
              radius={[4, 4, 0, 0]}
              name="Hours Worked"
            />
            <Bar 
              dataKey="projectsCompleted" 
              fill="url(#projectsGradient)" 
              radius={[4, 4, 0, 0]}
              name="Projects Completed"
            />
            <defs>
              <linearGradient id="hoursGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.6}/>
              </linearGradient>
              <linearGradient id="projectsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.6}/>
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}