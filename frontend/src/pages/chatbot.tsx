import { useEffect, useState, useRef, Fragment } from "react";
import { getWorkers, getProjects, getClockEntries } from "../api";
import { motion } from "framer-motion";

// --- INTERFACES ---
interface Worker {
  id: number;
  name: string;
  role: string;
}
interface Project {
  id: number;
  name: string;
}
interface ClockEntry {
  id: number;
  worker_id: number;
  project_id: number;
  worker_name: string;
  project_name: string;
  clock_in_time: string;
  clock_out_time?: string | null;
}
interface ChatMessage {
  id: number;
  sender: "user" | "bot" | "suggestion" | "typing";
  content: React.ReactNode;
}

// --- UI HELPER COMPONENTS & ICONS ---
const BotIcon = () => ( <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg></div> );
const TypingIndicator = () => ( <div className="flex items-center space-x-1"><motion.div className="w-2 h-2 bg-slate-400 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }} /><motion.div className="w-2 h-2 bg-slate-400 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 1, delay: 0.2, repeat: Infinity, ease: "easeInOut" }} /><motion.div className="w-2 h-2 bg-slate-400 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 1, delay: 0.4, repeat: Infinity, ease: "easeInOut" }} /></div> );
const BotResponseCard = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode; }) => ( <div className="mt-2 border-t border-gray-300/50 pt-2"><h3 className="font-bold text-sm mb-1 flex items-center gap-2"><span className="text-lg">{icon}</span>{title}</h3><div className="text-sm font-light">{children}</div></div> );

// --- MAIN CHATBOT COMPONENT ---
export default function Chatbot() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [entries, setEntries] = useState<ClockEntry[]>([]);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([getWorkers(), getProjects(), getClockEntries()]).then(
      ([w, p, e]) => {
        setWorkers(w || []);
        setProjects(p || []);
        setEntries(e || []);
        setMessages([
          { id: Date.now(), sender: "bot", content: (
             <div className="flex items-start gap-2">
                <span className="text-2xl mt-1">👋</span>
                <div>
                    <p className="font-semibold">Hi! I'm your Project Assistant.</p>
                    <p className="text-sm mt-1">You can ask me about workers or projects.</p>
                </div>
             </div>
            )},
          { id: Date.now() + 1, sender: "suggestion", content: (
              <div className="flex flex-wrap gap-2 mt-2">
                {(w || []).slice(0, 2).map(worker => <button key={worker.id} onClick={() => handleSuggestion(worker.name)} className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200">About {worker.name}</button>)}
                {(p || []).slice(0, 1).map(project => <button key={project.id} onClick={() => handleSuggestion(project.name)} className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200">Who is on {project.name}?</button>)}
              </div>
            )}
        ]);
      }
    );
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSuggestion = (suggestionText: string) => { setQuery(suggestionText); };

  const handleQuery = (currentQuery: string = query) => {
    const trimmedQuery = currentQuery.trim();
    if (!trimmedQuery) return;
    const q = trimmedQuery.toLowerCase();
    const userMessage: ChatMessage = { id: Date.now(), sender: "user", content: trimmedQuery };
    const typingMessage: ChatMessage = { id: Date.now() + 1, sender: 'typing', content: ""};
    setMessages((prev) => [...prev.filter(m => m.sender !== 'suggestion'), userMessage, typingMessage]);
    setQuery("");

    setTimeout(() => {
        let botResponse: React.ReactNode;
        const worker = workers.find((w) => w.name.toLowerCase() === q);
        const project = projects.find((p) => p.name.toLowerCase() === q);

        if (worker) {
            const workerEntries = entries.filter((e) => e.worker_id === worker.id);
            botResponse = (
                <BotResponseCard title={`${worker.name} - ${worker.role}`} icon="👷">
                    {workerEntries.length > 0 ? (
                        <ul className="space-y-2 pl-1 mt-2">
                            {workerEntries.map((e) => (
                                <li key={e.id} className="text-xs border-l-2 pl-2 border-blue-300">
                                    <strong>Project:</strong> {e.project_name}<br />
                                    <strong>Clock In:</strong> {new Date(e.clock_in_time).toLocaleString()}<br />
                                    <strong>Clock Out:</strong> {e.clock_out_time ? new Date(e.clock_out_time).toLocaleString() : <span className="text-green-600 font-semibold">Active</span>}
                                </li>
                            ))}
                        </ul>
                    ) : ( "No time entries found." )}
                </BotResponseCard>
            );
        } else if (project) {
            const projectEntries = entries.filter((e) => e.project_id === project.id);
            const uniqueWorkers = [...new Map(projectEntries.map(item => [item.worker_name, item])).values()];
            botResponse = (
                <BotResponseCard title={`Project: ${project.name}`} icon="📁">
                    {uniqueWorkers.length > 0 ? (
                        <ul className="space-y-1 pl-1 mt-2">
                            {uniqueWorkers.map((e) => (
                                <li key={e.id} className="text-xs border-l-2 pl-2 border-green-300">
                                    <strong>Worker:</strong> {e.worker_name}
                                </li>
                            ))}
                        </ul>
                    ) : ( "No workers have clocked into this project yet." )}
                </BotResponseCard>
            );
        } else {
            botResponse = "❓ I couldn't find a matching worker or project. Please try a different name.";
        }

        const botMessage: ChatMessage = { id: Date.now() + 2, sender: "bot", content: botResponse };
        setMessages((prev) => [...prev.filter(m => m.sender !== 'typing'), botMessage]);
    }, 1000);
  };

  return (
    <div className="font-sans bg-gradient-to-br from-gray-50 to-blue-100 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl h-[70vh] flex flex-col bg-white/60 backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-200/50 border border-white/50">
        <div className="p-4 border-b border-white/60 text-center">
            <h1 className="text-xl font-bold text-gray-700">Project Assistant</h1>
        </div>
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => (
             <Fragment key={msg.id}>
              {msg.sender !== 'suggestion' && (
                <motion.div 
                    className={`flex items-end gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                  {msg.sender === "bot" && <BotIcon />}
                  <div className={`px-4 py-3 rounded-2xl max-w-md shadow-md ${ msg.sender === "user" ? "bg-blue-500 text-white rounded-br-none" : "bg-white text-gray-800 rounded-bl-none"}`}>
                    {msg.sender === 'typing' ? <TypingIndicator/> : msg.content}
                  </div>
                </motion.div>
              )}
               {msg.sender === 'suggestion' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    {msg.content}
                  </motion.div>
              )}
            </Fragment>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="p-4 bg-white/70 border-t border-white/60">
          <div className="flex items-center bg-white rounded-full shadow-inner shadow-gray-200/80">
            <input
              type="text"
              placeholder="Ask about a worker or project..."
              className="flex-1 px-5 py-3 bg-transparent border-none focus:ring-0 text-gray-700 placeholder-gray-400"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQuery()}
            />
            <button
              onClick={() => handleQuery()}
              className="m-1 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-transform duration-200 active:scale-90"
              aria-label="Send message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086L2.279 16.76a.75.75 0 00.95.826l16-5.333a.75.75 0 000-1.418l-16-5.333z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}