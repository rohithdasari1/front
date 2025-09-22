import { motion } from 'framer-motion';
import { Star, Mail, Phone, MapPin, Calendar } from 'lucide-react';

interface Worker {
  name: string;
  role: string;
  avatar: string;
  rating: number;
  status: 'Available' | 'Busy' | 'On Leave';
  email: string;
  phone: string;
  location: string;
  joined: string;
  experience: number;
  skills: string[];
  currentProjects: string[];
}

interface WorkerCardProps {
  worker: Worker;
}

export default function WorkerCard({ worker }: WorkerCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Busy':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'On Leave':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <motion.div
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50"
      whileHover={{ scale: 1.03, y: -8, rotateY: 2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-4">
          <img 
            src={worker.avatar} 
            alt={worker.name}
            className="w-16 h-16 rounded-2xl object-cover shadow-lg"
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800">{worker.name}</h3>
            <p className="text-gray-600 text-sm">{worker.role}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    className={i < Math.floor(worker.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'} 
                  />
                ))}
                <span className="text-sm font-medium ml-1">{worker.rating}</span>
              </div>
              <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(worker.status)}`}>
                {worker.status}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Mail size={14} />
            <span>{worker.email}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Phone size={14} />
            <span>{worker.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={14} />
            <span>{worker.location}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar size={14} />
            <span>Joined {new Date(worker.joined).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Experience */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Experience Level</span>
            <span className="font-medium">{worker.experience}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${worker.experience}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
        </div>

        {/* Skills */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Skills</p>
          <div className="flex flex-wrap gap-1">
            {worker.skills.map((skill, index) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-lg">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Current Projects */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Current Projects</p>
          <p className="text-sm text-gray-800">{worker.currentProjects.join(', ')}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <motion.button
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm rounded-lg hover:shadow-lg transition-all duration-200"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            disabled={worker.status !== 'Available'}
          >
            Assign
          </motion.button>
          <motion.button
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-all duration-200"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            View Details
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}