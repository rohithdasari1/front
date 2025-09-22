import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const data = [
  { month: 'Jan', completed: 12, inProgress: 8, planned: 15 },
  { month: 'Feb', completed: 15, inProgress: 12, planned: 18 },
  { month: 'Mar', completed: 18, inProgress: 15, planned: 22 },
  { month: 'Apr', completed: 22, inProgress: 18, planned: 25 },
  { month: 'May', completed: 25, inProgress: 20, planned: 28 },
  { month: 'Jun', completed: 28, inProgress: 22, planned: 30 },
];

export default function MonthlyProgressChart() {
  return (
    <motion.div
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Monthly Progress Trend</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="month" 
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
            <Area 
              type="monotone" 
              dataKey="completed" 
              stackId="1"
              stroke="#10B981" 
              fill="url(#completedGradient)" 
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="inProgress" 
              stackId="1"
              stroke="#3B82F6" 
              fill="url(#progressGradient)" 
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="planned" 
              stackId="1"
              stroke="#F59E0B" 
              fill="url(#plannedGradient)" 
              strokeWidth={2}
            />
            <defs>
              <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="plannedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}