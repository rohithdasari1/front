import { motion } from 'framer-motion';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
}

export default function FeatureCard({ title, description, icon: Icon, gradient }: FeatureCardProps) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50 group"
      whileHover={{ scale: 1.05, y: -10, rotateX: 5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
    >
      <motion.div 
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-20 transition-opacity duration-500`}
        whileHover={{ scale: 1.1 }}
      />
      <div className="relative p-6 space-y-4">
        <motion.div 
          className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}
          whileHover={{ rotate: 360, scale: 1.2 }}
          transition={{ duration: 0.6 }}
        >
          <Icon size={24} className="text-white" />
        </motion.div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}