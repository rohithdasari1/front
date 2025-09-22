import { useEffect, useState, useMemo, Fragment } from "react";
import { getWorkers, createWorker, getProjects } from "../api";
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserX, Star, Briefcase } from 'lucide-react';

// --- INTERFACES (from original code) ---
interface Worker {
  id: number;
  name: string;
  role: string;
  assigned_project_id?: number | null;
}

interface Project {
  id: number;
  name: string;
}

// --- MOCK DATA GENERATION for UI enrichment ---
const mockSkills: { [key: string]: string[] } = {
    default: ['Communication', 'Teamwork', 'Problem Solving'],
    developer: ['React', 'Node.js', 'TypeScript', 'Docker', 'AWS'],
    designer: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
    manager: ['Agile', 'Scrum', 'Risk Management', 'Leadership'],
    analyst: ['Python', 'SQL', 'Tableau', 'Machine Learning'],
};

const enhanceWorkerData = (worker: Worker) => {
    const roleKey = worker.role.toLowerCase().includes('developer') ? 'developer'
                  : worker.role.toLowerCase().includes('designer') ? 'designer'
                  : worker.role.toLowerCase().includes('manager') ? 'manager'
                  : worker.role.toLowerCase().includes('analyst') ? 'analyst'
                  : 'default';

    return {
        ...worker,
        avatar: `https://i.pravatar.cc/150?u=${worker.id}`,
        rating: (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1),
        status: worker.assigned_project_id ? 'Busy' : 'Available',
        skills: mockSkills[roleKey],
        completedProjects: Math.floor(Math.random() * 20) + 1,
    };
};

// --- MAIN COMPONENT (MERGED) ---
export default function WorkersPage() {
  // --- STATE MANAGEMENT from original code ---
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // --- LOGIC from original code ---
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [workersData, projectsData] = await Promise.all([getWorkers(), getProjects()]);
      setWorkers(workersData || []);
      setProjects(projectsData || []);
    } catch (err) {
      setError("Failed to load data from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => { setName(""); setRole(""); };

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) {
      showNotification("Please fill in both name and role.", "error");
      return;
    }
    setIsCreating(true);
    try {
      const newWorker = await createWorker({ name, role });
      setWorkers((prev) => [...prev, newWorker]);
      showNotification(`Worker "${name}" was added successfully!`);
      resetForm();
      setIsModalOpen(false);
    } catch (err) {
      showNotification("Failed to create worker. Please try again.", "error");
    } finally {
      setIsCreating(false);
    }
  };

  // --- DATA PROCESSING to fit the new UI ---
  const { enhancedWorkers, workerStats, topPerformer } = useMemo(() => {
      const enhanced = workers.map(enhanceWorkerData);
      
      const stats = {
          total: workers.length,
          available: workers.filter(w => !w.assigned_project_id).length,
          busy: workers.filter(w => w.assigned_project_id).length,
      };

      const statCards = [
        { title: 'Total Workers', value: stats.total, icon: Users },
        { title: 'Available', value: stats.available, icon: UserCheck },
        { title: 'On Projects', value: stats.busy, icon: UserX },
      ];

      // Find a top performer (e.g., highest completed projects) or default to the first worker
      const performer = enhanced.sort((a, b) => b.completedProjects - a.completedProjects)[0] || null;

      return {
          enhancedWorkers: enhanced,
          workerStats: statCards,
          topPerformer: performer
      };
  }, [workers]);

  // --- Framer Motion variants ---
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 }}};
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 }};

  if (loading) return <div className="flex justify-center items-center h-screen bg-slate-100"><p>Loading Team Members...</p></div>;
  if (error) return <div className="p-4 text-center text-red-500 bg-red-100 rounded-md max-w-2xl mx-auto">{error}</div>;

  return (
    <motion.div 
      className="p-6 space-y-8 bg-slate-50 min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Team Management
          </h1>
          <p className="text-gray-600">Manage your team members and track their performance</p>
        </div>
         <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold text-sm rounded-md shadow-sm hover:bg-blue-700 transition-colors"
          >
            Add Worker
        </button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={itemVariants}
      >
        {workerStats.map((stat, index) => (
           <div key={index} className="bg-white p-5 rounded-xl shadow-md flex items-center space-x-4 border">
             <div className="bg-blue-100 text-blue-600 p-3 rounded-full"><stat.icon size={24}/></div>
             <div>
                <p className="text-sm text-slate-500 font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
           </div>
        ))}
      </motion.div>

      {/* Top Performer */}
      {topPerformer && (
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Star size={24} className="text-yellow-500" /> Top Performer
            </h2>
            <div className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-2xl p-6 border">
                <div className="flex items-center gap-6">
                    <img src={topPerformer.avatar} alt={topPerformer.name} className="w-20 h-20 rounded-2xl object-cover shadow-lg" />
                    <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-800">{topPerformer.name}</h3>
                        <p className="text-gray-600 mb-2">{topPerformer.role}</p>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1"><Star size={16} className="text-yellow-500 fill-current" /> <span className="font-medium">{topPerformer.rating}</span></div>
                            <span className="text-gray-600">•</span>
                            <span className="font-medium">{topPerformer.completedProjects} projects completed</span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {topPerformer.skills.map((skill, index) => (<span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-lg">{skill}</span>))}
                        </div>
                    </div>
                </div>
            </div>
          </motion.div>
      )}

      {/* Team Members Grid */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Users size={24} /> Team Members
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {enhancedWorkers.map((worker) => {
              const assignedProject = projects.find(p => p.id === worker.assigned_project_id);
              return (
                <div key={worker.id} className="bg-white rounded-xl shadow-lg border p-6 flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                    <div className="flex items-center gap-4">
                        <img src={worker.avatar} alt={worker.name} className="w-16 h-16 rounded-full object-cover"/>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-800">{worker.name}</h3>
                            <p className="text-sm text-slate-500">{worker.role}</p>
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t text-sm">
                        <span className={`font-semibold ${worker.status === 'Available' ? 'text-green-600' : 'text-amber-600'}`}>{worker.status}</span>
                        <div className="flex items-center gap-1"><Star size={16} className="text-yellow-500 fill-current" /> <span>{worker.rating}</span></div>
                    </div>
                     {assignedProject && (
                        <div className="mt-2 text-sm flex items-center gap-2 bg-slate-50 p-2 rounded-md">
                            <Briefcase size={16} className="text-slate-500" />
                            <span>On Project: <span className="font-semibold text-blue-600">{assignedProject.name}</span></span>
                        </div>
                    )}
                </div>
              );
          })}
        </div>
      </motion.div>

       {/* --- MODAL and NOTIFICATION from original code --- */}
       <Transition appear show={isModalOpen} as={Fragment}>
           <Dialog as="div" className="relative z-10" onClose={() => setIsModalOpen(false)}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black bg-opacity-40" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto"><div className="flex min-h-full items-center justify-center p-4 text-center">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                            <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900">Add a New Worker</Dialog.Title>
                            <form onSubmit={handleCreateWorker} className="mt-4 space-y-4">
                                <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="w-full border-slate-300 rounded-md" required/>
                                <input type="text" placeholder="Role (e.g., Developer, Designer)" value={role} onChange={e => setRole(e.target.value)} className="w-full border-slate-300 rounded-md" required/>
                                <div className="flex justify-end gap-2 pt-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                                    <button type="submit" disabled={isCreating} className="w-32 inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400">
                                        {isCreating ? "..." : "Add Worker"}
                                    </button>
                                </div>
                            </form>
                        </Dialog.Panel>
                    </Transition.Child>
                </div></div>
            </Dialog>
      </Transition>

      {notification && (
        <div className={`fixed bottom-5 right-5 px-6 py-3 rounded-lg shadow-xl text-white ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {notification.message}
        </div>
      )}
    </motion.div>
  );
}