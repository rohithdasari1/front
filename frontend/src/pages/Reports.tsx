import { motion } from 'framer-motion';
import ProjectStatusChart from '../components/charts/ProjectStatusChart';
import MonthlyProgressChart from '../components/charts/MonthlyProgressChart';
import TeamContributionChart from '../components/charts/TeamContributionChart';
import BudgetAnalysisChart from '../components/charts/BudgetAnalysisChart';
import KPICard from '../components/KPICard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.3 }
  }
};

export default function Reports() {
  const kpis = [
    { title: 'Delivery Rate', value: '94.2%', target: '95%', trend: 'up' },
    { title: 'Cost Savings', value: '18.5%', target: '15%', trend: 'up' },
    { title: 'Efficiency Score', value: '87.3%', target: '85%', trend: 'up' },
    { title: 'Client Satisfaction', value: '4.8/5', target: '4.5/5', trend: 'up' },
  ];

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
        <p className="text-gray-600">Comprehensive insights and performance metrics</p>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <ProjectStatusChart />
        </motion.div>
        <motion.div variants={itemVariants}>
          <MonthlyProgressChart />
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <TeamContributionChart />
      </motion.div>

      <motion.div variants={itemVariants}>
        <BudgetAnalysisChart />
      </motion.div>

      {/* KPI Summary */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, index) => (
            <KPICard key={index} {...kpi} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}