import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  User, 
  Tag, 
  Heart, 
  MessageCircle, 
  Eye,
  Send,
  X,
  AlertCircle,
  CheckCircle,
  Star,
  Bookmark,
  Share2,
  MoreHorizontal
} from 'lucide-react';
import StatCard from '../components/StatCard';

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

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 50 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 300 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8, 
    y: 50,
    transition: { duration: 0.2 }
  }
};

export default function Queries() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newQuery, setNewQuery] = useState({
    title: '',
    description: '',
    project: '',
    priority: 'medium',
    tags: []
  });

  const queryStats = [
    { title: 'Total Queries', value: '127', icon: MessageSquare, change: '+12%', trend: 'up' },
    { title: 'Open Queries', value: '43', icon: AlertCircle, change: '+8%', trend: 'up' },
    { title: 'Resolved', value: '84', icon: CheckCircle, change: '+15%', trend: 'up' },
    { title: 'Response Rate', value: '94.2%', icon: Clock, change: '+2.1%', trend: 'up' },
  ];

  const queries = [
    {
      id: 1,
      title: 'API Integration Issues with Payment Gateway',
      description: 'Having trouble integrating Stripe payment gateway with our e-commerce platform. The webhook responses are inconsistent and causing transaction failures.',
      author: 'Sarah Johnson',
      avatar: 'https://images.pexels.com/photos/3783471/pexels-photo-3783471.jpeg?auto=compress&cs=tinysrgb&w=400',
      project: 'E-commerce Platform',
      priority: 'high',
      status: 'open',
      tags: ['API', 'Payment', 'Integration'],
      likes: 12,
      replies: 8,
      views: 45,
      createdAt: '2024-01-15T10:30:00Z',
      isBookmarked: true
    },
    {
      id: 2,
      title: 'Mobile App Performance Optimization',
      description: 'The mobile app is experiencing slow loading times on older devices. Need suggestions for optimizing React Native performance and reducing bundle size.',
      author: 'Alex Chen',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
      project: 'Mobile App Development',
      priority: 'medium',
      status: 'in-progress',
      tags: ['Performance', 'React Native', 'Mobile'],
      likes: 8,
      replies: 5,
      views: 32,
      createdAt: '2024-01-14T14:20:00Z',
      isBookmarked: false
    },
    {
      id: 3,
      title: 'Database Schema Design for Analytics',
      description: 'Need help designing an efficient database schema for storing and querying large amounts of analytics data. Looking for best practices and optimization techniques.',
      author: 'Maria Garcia',
      avatar: 'https://images.pexels.com/photos/3777952/pexels-photo-3777952.jpeg?auto=compress&cs=tinysrgb&w=400',
      project: 'Data Analytics Dashboard',
      priority: 'low',
      status: 'resolved',
      tags: ['Database', 'Analytics', 'Schema'],
      likes: 15,
      replies: 12,
      views: 67,
      createdAt: '2024-01-13T09:15:00Z',
      isBookmarked: true
    },
    {
      id: 4,
      title: 'CI/CD Pipeline Configuration',
      description: 'Setting up automated deployment pipeline with Docker and Kubernetes. Need guidance on best practices for staging and production environments.',
      author: 'David Lee',
      avatar: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=400',
      project: 'Infrastructure Setup',
      priority: 'medium',
      status: 'open',
      tags: ['DevOps', 'CI/CD', 'Docker'],
      likes: 6,
      replies: 3,
      views: 28,
      createdAt: '2024-01-12T16:45:00Z',
      isBookmarked: false
    }
  ];

  const projects = [
    'E-commerce Platform',
    'Mobile App Development', 
    'Data Analytics Dashboard',
    'Infrastructure Setup',
    'AI Chatbot Integration'
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSubmitQuery = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle query submission logic here
    console.log('New query:', newQuery);
    setIsModalOpen(false);
    setNewQuery({ title: '', description: '', project: '', priority: 'medium', tags: [] });
  };

  const filteredQueries = queries.filter(query => {
    const matchesFilter = selectedFilter === 'all' || query.status === selectedFilter;
    const matchesSearch = query.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         query.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         query.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <motion.div 
      className="p-6 space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Team Queries & Support
        </h1>
        <p className="text-gray-600">Collaborate, ask questions, and share knowledge with your team</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={itemVariants}
      >
        {queryStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </motion.div>

      {/* Action Bar */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-4 items-center justify-between"
        variants={itemVariants}
      >
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search queries, projects, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200/50 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
            />
          </div>
          
          <div className="flex gap-2">
            {['all', 'open', 'in-progress', 'resolved'].map((filter) => (
              <motion.button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedFilter === filter
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'bg-white/50 text-gray-600 hover:bg-gray-100/50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1).replace('-', ' ')}
              </motion.button>
            ))}
          </div>
        </div>

        <motion.button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={20} />
          Post Query
        </motion.button>
      </motion.div>

      {/* Queries Grid */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={itemVariants}
      >
        <AnimatePresence>
          {filteredQueries.map((query, index) => (
            <motion.div
              key={query.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 group"
              whileHover={{ scale: 1.02, y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={query.avatar} 
                      alt={query.author}
                      className="w-10 h-10 rounded-xl object-cover shadow-md"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-800">{query.author}</h3>
                      <p className="text-sm text-gray-600">{query.project}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Share2 size={16} className="text-gray-500" />
                    </motion.button>
                    <motion.button
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <MoreHorizontal size={16} className="text-gray-500" />
                    </motion.button>
                  </div>
                </div>

                {/* Title and Description */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">{query.title}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{query.description}</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {query.tags.map((tag, tagIndex) => (
                    <span 
                      key={tagIndex}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-lg font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Status and Priority */}
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(query.status)}`}>
                    {query.status.replace('-', ' ').toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(query.priority)}`}>
                    {query.priority.toUpperCase()} PRIORITY
                  </span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <motion.button 
                      className="flex items-center gap-1 hover:text-red-500 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Heart size={16} />
                      <span>{query.likes}</span>
                    </motion.button>
                    <motion.button 
                      className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <MessageCircle size={16} />
                      <span>{query.replies}</span>
                    </motion.button>
                    <div className="flex items-center gap-1">
                      <Eye size={16} />
                      <span>{query.views}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      className={`p-2 rounded-lg transition-colors ${query.isBookmarked ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Bookmark size={16} fill={query.isBookmarked ? 'currentColor' : 'none'} />
                    </motion.button>
                    <span className="text-xs text-gray-400">
                      {new Date(query.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* New Query Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Post New Query</h2>
                <motion.button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={20} />
                </motion.button>
              </div>

              <form onSubmit={handleSubmitQuery} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Query Title</label>
                  <input
                    type="text"
                    value={newQuery.title}
                    onChange={(e) => setNewQuery({ ...newQuery, title: e.target.value })}
                    placeholder="Brief description of your query..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Description</label>
                  <textarea
                    value={newQuery.description}
                    onChange={(e) => setNewQuery({ ...newQuery, description: e.target.value })}
                    placeholder="Provide detailed information about your query, what you've tried, and what help you need..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                    <select
                      value={newQuery.project}
                      onChange={(e) => setNewQuery({ ...newQuery, project: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                      required
                    >
                      <option value="">Select a project</option>
                      {projects.map((project) => (
                        <option key={project} value={project}>{project}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={newQuery.priority}
                      onChange={(e) => setNewQuery({ ...newQuery, priority: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g., API, React, Database, Performance"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <motion.button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Send size={20} />
                    Post Query
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}