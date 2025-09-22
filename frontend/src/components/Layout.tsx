import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  Clock, 
  HelpCircle, 
  BarChart3, 
  MessageCircle,   // ✅ icon for chatbot
  Search,
  User,
  Menu,
  X
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: FolderKanban, label: 'Projects', path: '/projects' },
  { icon: Users, label: 'Workers', path: '/workers' },
  { icon: Clock, label: 'Clock Entries', path: '/clock-entries' },
  { icon: HelpCircle, label: 'Queries', path: '/queries' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
  { icon: MessageCircle, label: 'Chatbot', path: '/chatbot' }, // ✅ new
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <motion.aside 
        className="hidden lg:flex lg:w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex-col shadow-xl"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-6 border-b border-gray-200/50">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
            ProjectHub
          </h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                      : 'text-gray-600 hover:bg-gray-100/50 hover:text-gray-900'
                  }`}
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <item.icon size={20} />
                  </motion.div>
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </motion.aside>

      {/* Mobile Sidebar */}
      <motion.div 
        className={`lg:hidden fixed inset-0 z-50 ${isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        initial={false}
        animate={{ opacity: isMobileMenuOpen ? 1 : 0 }}
      >
        <div className={`absolute inset-0 bg-black/50 transition-opacity ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} 
             onClick={() => setIsMobileMenuOpen(false)} />
        <motion.aside 
          className="absolute left-0 top-0 h-full w-64 bg-white/95 backdrop-blur-xl shadow-xl"
          initial={{ x: '-100%' }}
          animate={{ x: isMobileMenuOpen ? 0 : '-100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
        >
          <div className="p-6 border-b border-gray-200/50 flex justify-between items-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              ProjectHub
            </h2>
            <button onClick={() => setIsMobileMenuOpen(false)}>
              <X size={24} className="text-gray-500" />
            </button>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} onClick={() => setIsMobileMenuOpen(false)}>
                  <motion.div
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                        : 'text-gray-600 hover:bg-gray-100/50 hover:text-gray-900'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <item.icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </motion.aside>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <motion.header 
          className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 p-4 shadow-sm"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <button 
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            
            <div className="flex-1 max-w-2xl mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search projects, teams, or tasks…"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200/50 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                />
              </div>
            </div>
            
            <motion.button 
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <User size={24} className="text-gray-600" />
            </motion.button>
          </div>
        </motion.header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
