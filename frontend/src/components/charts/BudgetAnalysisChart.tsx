import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

const data = [
  { month: 'Jan', allocated: 120000, spent: 98000, saved: 22000 },
  { month: 'Feb', allocated: 135000, spent: 115000, saved: 20000 },
  { month: 'Mar', allocated: 150000, spent: 125000, saved: 25000 },
  { month: 'Apr', allocated: 140000, spent: 118000, saved: 22000 },
  { month: 'May', allocated: 160000, spent: 135000, saved: 25000 },
  { month: 'Jun', allocated: 175000, spent: 145000, saved: 30000 },
];

export default function BudgetAnalysisChart() {
  return (
    <motion.div
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Budget & Spending Analysis</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
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
              tickFormatter={(value) => `$${value / 1000}K`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                backdropFilter: 'blur(10px)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="allocated" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
              name="Budget Allocated"
            />
            <Line 
              type="monotone" 
              dataKey="spent" 
              stroke="#EF4444" 
              strokeWidth={3}
              dot={{ fill: '#EF4444', strokeWidth: 2, r: 6 }}
              name="Amount Spent"
            />
            <Line 
              type="monotone" 
              dataKey="saved" 
              stroke="#10B981" 
              strokeWidth={3}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
              name="Amount Saved"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}