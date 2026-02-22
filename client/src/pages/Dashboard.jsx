import { useEffect, useState, useRef } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import {
  getTasks,
  createTask,
  deleteTask,
  updateTask,
} from "../api/taskApi";
import {
  DragDropContext,
  Droppable,
  Draggable
} from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Edit3,
  Calendar,
  CheckCircle2,
  GripVertical,
  Search,
  X,
  Check
} from "lucide-react";
import { cn } from "../api/utils";
import Sidebar from "../components/Sidebar";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

function Dashboard({ isDarkMode, toggleDarkMode }) {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [editingDate, setEditingDate] = useState("");

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [isAdding, setIsAdding] = useState(false);
  const inputRef = useRef(null);

  const navigate = useNavigate();

  // Fetch profile & tasks
  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await API.get("/auth/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        setUser(profileRes.data);

        const taskRes = await getTasks();
        setTasks(taskRes.data);
      } catch (error) {
        console.log(error);
        toast.error("Session expired. Please login again.");
        navigate("/");
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/");
  };

  // Add Task
  const addTask = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await createTask({
        title,
        dueDate: dueDate || undefined
      });
      setTasks([res.data, ...tasks]);
      setTitle("");
      setDueDate("");
      setIsAdding(false);
      toast.success("Task added successfully");
    } catch (error) {
      toast.error("Failed to add task");
    }
  };

  // Delete Task
  const removeTask = async (id) => {
    try {
      await deleteTask(id);
      setTasks(tasks.filter((task) => task._id !== id));
      toast.success("Task deleted");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  // Toggle Status
  const toggleStatus = async (task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    try {
      await updateTask(task._id, { status: newStatus });
      setTasks(tasks.map(t => t._id === task._id ? { ...t, status: newStatus } : t));
      toast.info(`Task ${newStatus === 'completed' ? 'completed!' : 'reopened'}`, {
        icon: newStatus === 'completed' ? <CheckCircle2 className="text-green-500" /> : <Clock className="text-blue-500" />
      });
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // Start Editing
  const startEditing = (task) => {
    setEditingId(task._id);
    setEditingText(task.title);
    setEditingDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "");
  };

  // Save Edit
  const saveEdit = async (id) => {
    if (!editingText.trim()) return;

    try {
      await updateTask(id, {
        title: editingText,
        dueDate: editingDate || null
      });
      setTasks(tasks.map(t => t._id === id ? {
        ...t,
        title: editingText,
        dueDate: editingDate || null
      } : t));
      setEditingId(null);
      setEditingText("");
      setEditingDate("");
      toast.success("Task updated");
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
    setEditingDate("");
  };

  // Drag and Drop Handler
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTasks(items);
  };

  // Filter + Search
  const filteredTasks = tasks
    .filter((task) => {
      if (filter === "pending") return task.status === "pending";
      if (filter === "completed") return task.status === "completed";
      return true;
    })
    .filter((task) =>
      task.title.toLowerCase().includes(search.toLowerCase())
    );

  // Progress calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  const progress =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
      <Sidebar
        user={user}
        onLogout={handleLogout}
        filter={filter}
        setFilter={setFilter}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onAddTask={() => {
          setIsAdding(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
      />

      <main className="flex-1 overflow-y-auto p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter">
                {filter === "all" ? "Dashboard" : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </h1>
              <p className="text-muted-foreground mt-1 md:mt-2 font-medium text-sm md:text-base">
                Keep track of your daily goals and objectives.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 w-full md:w-auto"
            >
              <div className="relative group w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 pr-6 py-4 rounded-2xl bg-card border-2 border-transparent focus:border-primary/20 focus:bg-background transition-all w-full md:w-80 shadow-sm outline-none"
                />
              </div>
            </motion.div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16 px-2">
            <motion.div
              whileHover={{ y: -8, scale: 1.01 }}
              className="col-span-1 md:col-span-2 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] bg-sidebar text-white shadow-2xl shadow-primary/20 relative overflow-hidden group border border-white/5"
            >
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                  <div className="flex-1">
                    <p className="text-primary font-black uppercase tracking-[0.3em] text-[8px] md:text-[10px] mb-2 font-mono text-left opacity-80">Efficiency Rating</p>
                    <h3 className="text-4xl md:text-7xl font-black tracking-tighter leading-none flex items-baseline italic justify-start text-white">
                      {progress}<span className="text-primary italic not-italic text-xl md:text-3xl ml-1">%</span>
                    </h3>
                  </div>
                  <div className="p-3 md:p-4 bg-white/10 rounded-2xl md:rounded-[2rem] backdrop-blur-xl border border-white/10 shadow-xl group-hover:rotate-12 transition-transform duration-500">
                    <CheckCircle2 size={24} className="text-primary md:w-8 md:h-8" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="w-full bg-white/5 rounded-full h-6 p-1.5 border border-white/10 shadow-inner overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1.5, ease: "circOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-primary via-primary/80 to-primary shadow-[0_0_25px_rgba(255,107,1,0.6)] relative overflow-hidden"
                    >
                      <motion.div
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                      />
                    </motion.div>
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <p className="text-sm font-bold text-white/50">
                      Completed <span className="text-white">{completedTasks}</span> of <span className="text-white">{totalTasks}</span> tasks
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                        {progress === 100 ? "Mastered" : "In Progress"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] -mr-40 -mt-40 transition-opacity group-hover:opacity-100 opacity-50" />
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-[80px]" />
            </motion.div>

            <motion.div
              whileHover={{ y: -8, scale: 1.01 }}
              className="p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] bg-card border border-border shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[100px] -mr-16 -mt-16 group-hover:opacity-100 opacity-0 transition-opacity" />
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 1, ease: "anticipate" }}
                className="w-16 h-16 md:w-20 md:h-20 rounded-[2rem] md:rounded-[2.5rem] bg-primary/10 flex items-center justify-center text-primary mb-6 md:mb-8 shadow-inner border border-primary/20"
              >
                <Calendar size={40} className="group-hover:scale-110 transition-transform" />
              </motion.div>
              <p className="text-muted-foreground text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] mb-2 md:mb-3">Timeline</p>
              <h3 className="text-3xl md:text-5xl font-black tracking-tighter text-card-foreground">
                {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                <span className="text-primary italic">.</span>
              </h3>
            </motion.div>

            <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mb-16 -mr-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
          </div>

          {/* Add Task Area */}
          <AnimatePresence>
            {isAdding && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className="mb-12 p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] bg-sidebar text-white shadow-2xl relative overflow-hidden ring-1 ring-white/10"
              >
                <div className="absolute top-0 left-0 w-3 h-full bg-primary" />
                <form onSubmit={addTask} className="space-y-8">
                  <div className="flex items-start gap-3 md:gap-5">
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary mt-1 md:mt-2 animate-pulse shadow-[0_0_15px_rgba(255,107,1,0.4)]" />
                    <input
                      ref={inputRef}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="What's the next objective?"
                      className="w-full text-xl md:text-3xl font-black bg-transparent border-none focus:ring-0 p-0 placeholder:text-white/20 tracking-tighter"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-4 pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 group hover:border-primary/40 transition-colors">
                      <Calendar size={20} className="text-white/40 group-hover:text-primary transition-colors" />
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-sm font-black p-0 w-32 outline-none cursor-pointer text-white"
                      />
                    </div>
                    <div className="flex-1" />
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setIsAdding(false)}
                        className="px-8 py-3 text-sm font-black rounded-2xl hover:bg-white/5 transition-all text-white/60 hover:text-white"
                      >
                        Discard
                      </button>
                      <button
                        type="submit"
                        disabled={!title.trim()}
                        className="px-10 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-30 disabled:hover:translate-y-0"
                      >
                        Create Task
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Task List Header */}
          <div className="flex items-center justify-between mb-6 md:mb-8 px-2 md:px-4">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-2 md:w-3 h-6 md:h-8 bg-primary rounded-full shadow-lg shadow-primary/20" />
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-foreground">Objectives<span className="text-primary">.</span></h2>
            </div>
          </div>

          {/* Task List */}
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="tasks">
              {(provided) => (
                <motion.div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-5"
                >
                  <AnimatePresence mode="popLayout">
                    {filteredTasks.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-24 bg-secondary/30 rounded-[3rem] border-4 border-dashed border-muted-foreground/10 flex flex-col items-center justify-center grayscale"
                      >
                        <div className="w-24 h-24 bg-muted rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
                          <Plus size={48} className="text-muted-foreground opacity-30" />
                        </div>
                        <h3 className="text-xl font-black text-muted-foreground/40 tracking-tight">Zero Objectives Found</h3>
                        <p className="text-sm font-bold text-muted-foreground/30 mt-1">Start by adding a new mission above.</p>
                      </motion.div>
                    ) : (
                      filteredTasks.map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided, snapshot) => (
                            <motion.div
                              layout
                              variants={itemVariants}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={cn(
                                "group flex items-center gap-3 md:gap-6 p-4 md:p-7 bg-card border border-black/[0.03] rounded-[2rem] md:rounded-[2.5rem] shadow-sm transition-all hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5",
                                snapshot.isDragging && "shadow-3xl ring-8 ring-primary/10 bg-card z-50 scale-[1.02] border-primary/20",
                                task.status === "completed" && "opacity-60 bg-secondary/20 border-transparent shadow-none"
                              )}
                            >
                              <div {...provided.dragHandleProps} className="text-muted-foreground/10 group-hover:text-primary transition-colors cursor-grab active:cursor-grabbing shrink-0">
                                <GripVertical size={20} className="md:w-7 md:h-7" />
                              </div>

                              <button
                                onClick={() => toggleStatus(task)}
                                className={cn(
                                  "shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl border-2 transition-all flex items-center justify-center shadow-lg active:scale-90",
                                  task.status === "completed"
                                    ? "bg-sidebar border-sidebar text-white shadow-sidebar/10"
                                    : "bg-card border-primary/20 text-primary hover:border-primary hover:bg-primary/5"
                                )}
                              >
                                {task.status === "completed" ? <Check size={18} className="md:w-6 md:h-6" strokeWidth={4} /> : null}
                              </button>

                              <div className="flex-1 min-w-0">
                                {editingId === task._id ? (
                                  <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center w-full">
                                    <div className="flex-1 min-w-0 space-y-4">
                                      <input
                                        autoFocus
                                        value={editingText}
                                        onChange={(e) => setEditingText(e.target.value)}
                                        className="w-full bg-card-foreground text-card border-none px-6 py-4 rounded-2xl text-base md:text-lg font-black tracking-tight shadow-lg outline-none ring-2 ring-primary/20"
                                      />
                                      <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-foreground/5 border border-transparent transition-colors w-full md:w-fit">
                                        <Calendar size={16} className="text-muted-foreground shrink-0" />
                                        <input
                                          type="date"
                                          value={editingDate}
                                          onChange={(e) => setEditingDate(e.target.value)}
                                          className="bg-transparent border-none focus:ring-0 text-xs font-black p-0 w-full md:w-28 outline-none cursor-pointer text-foreground"
                                        />
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 justify-end">
                                      <button
                                        onClick={() => saveEdit(task._id)}
                                        className="p-3 md:p-4 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 active:scale-90 transition-transform"
                                        aria-label="Save changes"
                                      >
                                        <Check size={20} md:size={24} strokeWidth={4} />
                                      </button>
                                      <button
                                        onClick={cancelEdit}
                                        className="p-3 md:p-4 bg-secondary rounded-2xl active:scale-90 transition-transform text-foreground"
                                        aria-label="Cancel editing"
                                      >
                                        <X size={20} md:size={24} strokeWidth={4} />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="py-1">
                                    <h4 className={cn(
                                      "text-base md:text-xl font-black transition-all truncate tracking-tight text-card-foreground",
                                      task.status === "completed" && "opacity-40 line-through decoration-primary decoration-2"
                                    )}>
                                      {task.title}
                                    </h4>
                                    {task.dueDate && (
                                      <div className={cn(
                                        "flex items-center gap-2 mt-2 text-[10px] font-black uppercase tracking-widest",
                                        new Date(task.dueDate) < new Date() && task.status !== "completed" ? "text-destructive" : "text-muted-foreground opacity-60"
                                      )}>
                                        <Calendar size={14} className="opacity-70" />
                                        <span>Target: {new Date(task.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2 md:gap-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all md:translate-x-4 md:group-hover:translate-x-0 shrink-0">
                                <button
                                  onClick={() => startEditing(task)}
                                  className="p-3 md:p-4 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-2xl transition-all active:scale-90"
                                >
                                  <Edit3 size={20} className="md:w-6 md:h-6" />
                                </button>
                                <button
                                  onClick={() => removeTask(task._id)}
                                  className="p-3 md:p-4 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-2xl transition-all active:scale-90"
                                >
                                  <Trash2 size={20} className="md:w-6 md:h-6" />
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </Draggable>
                      ))
                    )}
                  </AnimatePresence>
                  {provided.placeholder}
                </motion.div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </main >
    </div >
  );
}

export default Dashboard;