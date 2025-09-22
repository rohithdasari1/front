import { useEffect, useState, useMemo, Fragment } from "react";
import { getProjects, createProject, getWorkers, assignWorker } from "../api";
import { Dialog, Transition, Listbox } from '@headlessui/react';
import { motion } from 'framer-motion';
import { Calendar, Briefcase, FolderPlus, PlayCircle, CheckCircle, PauseCircle, PieChart, BarChart2, ChevronDown, Check } from 'lucide-react';
import { 
    PieChart as RechartsPieChart, 
    Pie, 
    Cell, 
    BarChart as RechartsBarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    Tooltip, 
    Legend, 
    ResponsiveContainer 
} from 'recharts';

// --- INTERFACES ---
type Project = { id: number; name: string; description?: string; status: string; };
type Worker = { id: number; name: string; role: string; assigned_project_id?: number | null; };

// --- HELPER COMPONENTS ---
const ProgressBar = ({ progress }: { progress: number }) => ( <div><div className="flex justify-between mb-1"><span className="text-xs font-medium text-slate-500">Progress</span><span className="text-xs font-medium text-slate-500">{progress}%</span></div><div className="w-full bg-slate-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div></div></div>);
const RiskBadge = ({ risk }: { risk: 'low' | 'medium' | 'high' }) => { const styles = { low: 'bg-green-100 text-green-800', medium: 'bg-amber-100 text-amber-800', high: 'bg-red-100 text-red-800' }; return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${styles[risk]}`}>{risk}</span>; };

// --- MAIN COMPONENT ---
export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newStatus, setNewStatus] = useState("Active");
  const [selectedWorkers, setSelectedWorkers] = useState<{ [key: number]: number | null }>({});
  const [assigningWorker, setAssigningWorker] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => { setNotification({ message, type }); setTimeout(() => setNotification(null), 4000); };

  useEffect(() => { Promise.all([getProjects(), getWorkers()]).then(([p, w]) => { setProjects(p || []); setWorkers(w || []); }).catch(() => setError("Failed to load project data.")).finally(() => setLoading(false)); }, []);
  
  const resetForm = () => { setNewName(""); setNewDesc(""); setNewStatus("Active"); };

  const handleCreateProject = async (e: React.FormEvent) => { e.preventDefault(); setIsCreating(true); try { const newProject = await createProject({ name: newName, description: newDesc, status: newStatus }); setProjects(p => [...p, newProject]); showNotification(`Project "${newName}" created!`); resetForm(); setIsModalOpen(false); } catch { setError("Failed to create project."); } finally { setIsCreating(false); } };
  const handleAssignWorker = async (projectId: number) => { const workerId = selectedWorkers[projectId]; if (!workerId) { showNotification("Please select a worker.", "error"); return; } setAssigningWorker(projectId); try { await assignWorker(projectId, Number(workerId)); const updatedWorkers = await getWorkers(); setWorkers(updatedWorkers); setSelectedWorkers(p => ({...p, [projectId]: null})); showNotification(`Worker assigned.`); } catch { setError("Failed to assign worker."); } finally { setAssigningWorker(null); } };
  
  const availableWorkers = workers; 

  const { runningProjects, upcomingProjects, projectStatusData, teamAllocationData } = useMemo(() => {
    const enhanced = projects.map(p => ({ ...p, progress: p.status === 'Completed' ? 100 : Math.floor(Math.random() * 85) + 10, risk: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any, team: workers.filter(w => w.assigned_project_id === p.id) }));
    const statusCounts = projects.reduce((acc, p) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc; }, {} as {[key: string]: number});
    const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    const allocationData = projects.map(p => ({ name: p.name, teamSize: workers.filter(w => w.assigned_project_id === p.id).length })).filter(p => p.teamSize > 0);

    return { runningProjects: enhanced.filter(p => p.status === 'Active' || p.status === 'Completed'), upcomingProjects: enhanced.filter(p => p.status === 'On Hold'), projectStatusData: statusData, teamAllocationData: allocationData };
  }, [projects, workers]);

  const CHART_COLORS = ['#3b82f6', '#22c55e', '#f97316', '#a855f7'];
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 }}};
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 }};

  if (loading) return <div className="flex justify-center items-center h-screen"><p>Loading Projects Overview...</p></div>;
  if (error) return <div className="p-4 text-center text-red-500 bg-red-100 rounded-md">{error}</div>;

  return (
    <motion.div className="p-6 space-y-8 bg-slate-50 min-h-screen" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <div><h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Projects Overview</h1><p className="text-slate-500">Monitor and manage all your projects from one place</p></div>
        <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold text-sm rounded-md shadow-sm hover:bg-blue-700">New Project</button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold text-slate-700 mb-6 flex items-center gap-3"><Briefcase size={24} className="text-blue-600"/>Active & Completed Projects</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {runningProjects.map(project => {
              const isAssigning = assigningWorker === project.id;
              const selectedWorkerForProject = workers.find(w => w.id === selectedWorkers[project.id]);
              return (
                <motion.div key={project.id} variants={itemVariants} className="bg-white rounded-xl shadow-lg border flex flex-col">
                    <div className="p-6">
                        <div className="flex justify-between items-start"><h3 className="text-lg font-bold text-slate-700">{project.name}</h3> <RiskBadge risk={project.risk} /></div>
                        <p className="text-sm text-slate-500 mt-2 min-h-[40px]">{project.description}</p>
                        <div className="mt-4"><ProgressBar progress={project.progress} /></div>
                    </div>
                    <div className="px-6 py-4 bg-slate-50">
                        <h3 className="text-sm font-semibold text-slate-600 mb-2">Assigned Team</h3>
                        <div className="flex flex-wrap gap-2 min-h-[32px]">
                            {project.team.length > 0 ? (
                                project.team.map(w => <span key={w.id} className="px-2 py-1 text-xs bg-slate-200 text-slate-700 rounded-full">{w.name}</span>)
                            ) : (<p className="text-xs text-slate-400 italic">No workers assigned.</p>)}
                        </div>
                    </div>
                    <div className="p-6 mt-auto border-t">
                        <div className="flex gap-2">
                            <Listbox value={selectedWorkers[project.id]} onChange={(workerId) => setSelectedWorkers(prev => ({...prev, [project.id]: workerId}))}>
                                <div className="relative w-full">
                                    <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left border border-slate-300 shadow-sm focus:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300 sm:text-sm h-10">
                                        <span className="block truncate">{selectedWorkerForProject ? selectedWorkerForProject.name : "Assign a worker..."}</span>
                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"><ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" /></span>
                                    </Listbox.Button>
                                    <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-10">
                                            {availableWorkers.map(worker => (
                                                <Listbox.Option key={worker.id} value={worker.id} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'}`}>
                                                    {({ selected }) => (<>
                                                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{worker.name}</span>
                                                        {selected ? (<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600"><Check className="h-5 w-5" aria-hidden="true" /></span>) : null}
                                                    </>)}
                                                </Listbox.Option>
                                            ))}
                                        </Listbox.Options>
                                    </Transition>
                                </div>
                            </Listbox>
                            <button onClick={() => handleAssignWorker(project.id)} disabled={isAssigning} className="w-32 h-10 inline-flex items-center justify-center text-sm font-semibold text-white rounded-md shadow-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400">{isAssigning ? "..." : "Assign"}</button>
                        </div>
                    </div>
                </motion.div>
              )
          })}
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold text-slate-700 mb-6 flex items-center gap-3"><Calendar size={24} className="text-purple-600"/>On-Hold Projects</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {upcomingProjects.map((project) => (
                <motion.div key={project.id} variants={itemVariants} className="bg-white/80 rounded-xl shadow-lg border p-6">
                     <div className="flex justify-between items-start"><h3 className="text-lg font-bold text-slate-700">{project.name}</h3></div>
                     <p className="text-sm text-slate-500 mt-2">{project.description}</p>
                      <div className="mt-4 pt-4 border-t"><p className="text-sm text-amber-700 font-semibold">This project is currently on hold.</p></div>
                </motion.div>
            ))}
        </div>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold text-slate-700 mb-6 flex items-center gap-3"><PieChart size={24} className="text-blue-600"/>Project Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border"><h3 className="font-semibold text-slate-700 mb-4">Projects by Status</h3><div style={{width: '100%', height: 300}}><ResponsiveContainer>
                <RechartsPieChart><Pie data={projectStatusData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} fill="#8884d8" paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>{projectStatusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />))}</Pie><Tooltip /></RechartsPieChart>
            </ResponsiveContainer></div></div>
            <div className="bg-white p-6 rounded-xl shadow-lg border"><h3 className="font-semibold text-slate-700 mb-4">Team Allocation</h3><div style={{width: '100%', height: 300}}><ResponsiveContainer>
                <RechartsBarChart data={teamAllocationData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}><XAxis type="number" /><YAxis type="category" dataKey="name" width={100} tick={{fontSize: 12}} /><Tooltip cursor={{fill: 'rgba(241, 245, 249, 0.5)'}}/><Bar dataKey="teamSize" fill="#3b82f6" name="Team Size" barSize={30} /></RechartsBarChart>
            </ResponsiveContainer></div></div>
        </div>
      </motion.div>

      <Transition appear show={isModalOpen} as={Fragment}>
           <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"><div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm" /></Transition.Child>
                <div className="fixed inset-0 overflow-y-auto"><div className="flex min-h-full items-center justify-center p-4 text-center">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                        <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                            <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-slate-700 flex items-center gap-3"><FolderPlus className="text-blue-600" /> Create a New Project</Dialog.Title>
                            <form onSubmit={handleCreateProject} className="mt-6 space-y-6">
                                <div><label htmlFor="projectName" className="block text-sm font-medium text-slate-600 mb-1">Project Name</label><input type="text" id="projectName" placeholder="e.g., Q4 Marketing Campaign" value={newName} onChange={e => setNewName(e.target.value)} className="w-full border-slate-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500" required/></div>
                                <div><label htmlFor="projectDesc" className="block text-sm font-medium text-slate-600 mb-1">Description</label><textarea id="projectDesc" placeholder="A brief summary of the project's goals..." value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full border-slate-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500" rows={3}/></div>
                                <div><label className="block text-sm font-medium text-slate-600 mb-2">Status</label><div className="flex space-x-2">{(['Active', 'Completed', 'On Hold'] as const).map(status => (<button type="button" key={status} onClick={() => setNewStatus(status)} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all border-2 ${newStatus === status ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-transparent bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{status === 'Active' && <PlayCircle size={16}/>}{status === 'Completed' && <CheckCircle size={16}/>}{status === 'On Hold' && <PauseCircle size={16}/>}{status}</button>))}</div></div>
                                <div className="flex justify-end gap-3 pt-6"><button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-sm font-semibold text-gray-700 bg-slate-100 rounded-lg hover:bg-slate-200">Cancel</button><button type="submit" disabled={isCreating} className="w-36 inline-flex justify-center rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:bg-blue-400">{isCreating ? "Creating..." : "Create Project"}</button></div>
                            </form>
                        </Dialog.Panel>
                    </Transition.Child>
                </div></div>
            </Dialog>
      </Transition>

      {notification && ( <div className={`fixed bottom-5 right-5 px-6 py-3 rounded-lg shadow-xl text-white ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>{notification.message}</div> )}
    </motion.div>
  );
}