import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  target: string;
  trend: 'up' | 'down' | 'neutral';
}

export default function KPICard({ title, value, target, trend }: KPICardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} className="text-green-500" />;
      case 'down':
        return <TrendingDown size={16} className="text-red-500" />;
      default:
        return <Target size={16} className="text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'border-green-200 bg-green-50';
      case 'down':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <motion.div
      className={`rounded-2xl p-6 border-2 ${getTrendColor()} transition-all duration-300`}
      whileHover={{ scale: 1.02, y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          {getTrendIcon()}
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-600">Target: {target}</p>
        </div>
      </div>
    </motion.div>
  );
}