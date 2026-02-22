import { useState } from "react";
import {
    LayoutDashboard,
    CheckCircle2,
    Clock,
    LogOut,
    Plus,
    Moon,
    Sun,
    Menu,
    X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../api/utils";

const Sidebar = ({
    user,
    onLogout,
    filter,
    setFilter,
    isDarkMode,
    toggleDarkMode,
    onAddTask
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        { id: "all", label: "All Tasks", icon: LayoutDashboard },
        { id: "pending", label: "Pending", icon: Clock },
        { id: "completed", label: "Completed", icon: CheckCircle2 },
    ];

    const handleFilterSelect = (id) => {
        setFilter(id);
        if (window.innerWidth < 768) {
            setIsOpen(false);
        }
    };

    return (
        <>
            {/* Mobile Menu Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-6 left-6 z-50 p-3 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 md:hidden active:scale-95 transition-transform"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Overlay Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
                    />
                )}
            </AnimatePresence>

            <div className={cn(
                "fixed inset-y-0 left-0 z-40 w-72 bg-sidebar border-r border-white/5 transition-transform duration-500 ease-out transform md:translate-x-0 md:static md:inset-auto md:flex md:flex-col shadow-2xl md:shadow-none text-sidebar-foreground",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/40 group-hover:rotate-12 transition-transform">T</div>
                        <h2 className="text-2xl font-black tracking-tight text-white">TaskMaster</h2>
                    </div>
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-black ml-1">Manage your day, better.</p>
                </div>

                <nav className="flex-1 px-6 space-y-2 mt-4">
                    <button
                        onClick={() => {
                            onAddTask();
                            if (window.innerWidth < 768) setIsOpen(false);
                        }}
                        className="flex items-center w-full gap-3 px-4 py-4 text-sm font-black rounded-2xl bg-white text-sidebar shadow-xl hover:bg-primary hover:text-white hover:-translate-y-1 transition-all active:scale-95 mb-8 group"
                    >
                        <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                        <span>New Task</span>
                    </button>

                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleFilterSelect(item.id)}
                            className={cn(
                                "flex items-center w-full gap-3 px-4 py-4 text-sm font-bold rounded-2xl transition-all",
                                filter === item.id
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "text-white/60 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <item.icon size={20} className={cn(
                                "transition-colors",
                                filter === item.id ? "text-white" : "text-white/40 group-hover:text-white"
                            )} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-6 mt-auto">
                    {user && (
                        <div className="flex items-center gap-3 px-4 py-4 mb-4 bg-white/5 border border-white/10 rounded-2xl">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold border-2 border-sidebar shadow-md">
                                {user.name[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate text-white">{user.name}</p>
                                <p className="text-[9px] text-white/40 truncate uppercase tracking-widest font-black">{user.email}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={toggleDarkMode}
                            className="flex items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-primary hover:border-primary/40 transition-all active:scale-95"
                            title={isDarkMode ? "Light Mode" : "Dark Mode"}
                        >
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button
                            onClick={onLogout}
                            className="flex items-center justify-center p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive-foreground hover:bg-destructive transition-all active:scale-95"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
