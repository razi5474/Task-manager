import { useState } from "react";
import API from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, User, Mail, Lock } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
};

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/register", { name, email, password });
      toast.success("Account created successfully", {
        description: "You can now log in with your credentials."
      });
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -ml-48 -mt-48" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-primary/5 rounded-full blur-[80px]" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-sidebar p-8 md:p-14 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl relative overflow-hidden group border border-white/5 text-white">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.div variants={itemVariants} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-xl md:text-2xl shadow-lg shadow-primary/30">T</div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white italic">Register<span className="text-primary not-italic">.</span></h1>
              </div>
              <p className="text-white/40 text-sm font-bold tracking-tight">Create your tactical operative profile.</p>
            </motion.div>

            <form onSubmit={handleRegister} className="space-y-5">
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-white/50 ml-1">Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-foreground border-none focus:ring-4 focus:ring-primary/20 transition-all font-bold placeholder:text-muted-foreground/30 shadow-inner"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </motion.div>
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-white/50 ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary transition-colors" size={20} />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-foreground border-none focus:ring-4 focus:ring-primary/20 transition-all font-bold placeholder:text-muted-foreground/30 shadow-inner"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </motion.div>
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-white/50 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary transition-colors" size={20} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-foreground border-none focus:ring-4 focus:ring-primary/20 transition-all font-bold placeholder:text-muted-foreground/30 shadow-inner"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </motion.div>

              <motion.button
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full p-4 md:p-5 bg-primary text-white text-lg font-black rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95 flex items-center justify-center gap-3 group disabled:opacity-50 mt-4 md:mt-2"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : (
                  <>
                    Initialize Profile
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>

            <motion.p variants={itemVariants} className="text-center text-white/30 text-xs font-bold">
              Existing operative?{" "}
              <Link to="/" className="text-primary hover:text-primary/80 underline underline-offset-4 decoration-2 transition-colors">
                Return to Login
              </Link>
            </motion.p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-12 text-foreground/20 font-black uppercase tracking-[0.5em] text-[10px]"
        >
          &copy; 2026 TaskMaster Systems
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Register;