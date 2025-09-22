import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";
import { motion } from "framer-motion";
import { User, Lock, LogIn, AlertCircle } from "lucide-react";

// --- Animated Background (consistent with Dashboard) ---
const AnimatedBackground = () => (
  <div className="fixed inset-0 -z-10 w-full h-full overflow-hidden bg-slate-50">
    <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
    <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000"></div>
  </div>
);

// --- Spinner Icon for loading button ---
const SpinnerIcon = () => <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

export default function Login() {
  const [username, setUsername] = useState("manager1"); // Default for easy testing
  const [password, setPassword] = useState("manager123"); // Default for easy testing
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = await login(username, password);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "Manager") navigate("/dashboard");
      else if (user.role === "Supervisor") navigate("/projects");
      else if (user.role === "Worker") navigate("/clockentries");
      else navigate("/");

    } catch (err: any) {
      setError("Invalid username or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 }};

  return (
    <div className="relative min-h-screen w-full font-sans">
      <AnimatedBackground />
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="grid lg:grid-cols-2 max-w-4xl w-full bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/50">
          
          {/* Left Panel (Branding) */}
          <div className="hidden lg:flex flex-col justify-center p-12 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-4xl font-bold">ProjectHub</h1>
              <p className="mt-4 text-lg opacity-80">Your all-in-one solution for modern project management and team collaboration.</p>
            </motion.div>
          </div>

          {/* Right Panel (Login Form) */}
          <div className="p-8 md:p-12">
            <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 }}}}>
              <motion.h2 variants={itemVariants} className="text-3xl font-bold text-slate-800 mb-2">Welcome Back!</motion.h2>
              <motion.p variants={itemVariants} className="text-slate-500 mb-8">Please enter your details to sign in.</motion.p>
              
              <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-100 border border-red-300 text-red-700 text-sm rounded-lg p-3 mb-6 flex items-center gap-2"
                    >
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </motion.div>
                )}
              </AnimatePresence>
              
              <form onSubmit={handleLogin} className="space-y-6">
                <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Username</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
                    </div>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
                     <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
                    </div>
                </motion.div>
                
                <motion.div variants={itemVariants} className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-semibold shadow-lg"
                  >
                    {loading ? <SpinnerIcon /> : <><LogIn size={20} /> Sign In</>}
                  </button>
                </motion.div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}