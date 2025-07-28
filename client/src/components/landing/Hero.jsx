/* eslint-disable no-unused-vars */
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    CheckCircle, Calendar, FolderOpen, Zap, BellRing, Users, ListTree, Activity, Star,
    User, Award, Search, Heart, TrendingUp, Lock, Briefcase, Inbox,
    Tag, LayoutGrid, Download, Share2, Settings, BarChart
} from 'lucide-react';

const Hero = () => {
    // Define Framer Motion variants for staggered animations
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.07,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 10,
            },
        },
    };

    const buttonVariants = {
        hidden: { scale: 0.9, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 150,
                damping: 15,
                delay: 0.5,
            },
        },
        hover: {
            scale: 1.05,
            boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.2)",
            transition: { duration: 0.2 },
        },
        tap: { scale: 0.95 },
    };

    const secondaryButtonVariants = {
        hidden: { scale: 0.9, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 150,
                damping: 15,
                delay: 0.8,
            },
        },
        hover: {
            scale: 1.05,
            boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.2)",
            transition: { duration: 0.2 },
        },
        tap: { scale: 0.95 },
    };

    const iconVariants = {
        hidden: { scale: 0, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 0.4,
            transition: {
                type: "spring",
                stiffness: 80,
                damping: 8,
                delay: 1.0,
            },
        },
    };

    const featureItemVariants = { // This variant will be passed to the Features component
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 90,
                damping: 9,
            },
        },
    };

    return (
        <section className="relative min-h-screen bg-gradient-to-br from-blue-700 to-purple-800 text-white flex items-center justify-center p-6 overflow-hidden">
            {/* Background Gradients/Shapes for modern feel */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
                {/* Additional subtle background elements */}
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-6000"></div>
            </div>

            {/* Content Container */}
            <motion.div
                className="relative z-10 max-w-7xl text-center px-6 py-10 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Logo Section */}
                <motion.div variants={itemVariants} className="mb-8">
                    <img
                        src="/Designer.webp" // <--- CHANGE THIS URL TO YOUR LOGO
                        alt="Taskery Logo"
                        className="mx-auto h-24 w-24 object-contain rounded-full shadow-lg border-2 border-white/30"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/120x120/CCCCCC/000000?text=Logo+Error"; }}
                    />
                </motion.div>

                <motion.h1
                    className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight tracking-tight drop-shadow-lg"
                    variants={itemVariants}
                >
                    <span className="text-blue-300">Taskery:</span> Your Ideas, Organized.
                </motion.h1>
                <motion.p
                    className="text-xl sm:text-2xl font-semibold mb-6 max-w-3xl mx-auto opacity-95 drop-shadow-sm"
                    variants={itemVariants}
                >
                    Achieve More, Stress Less.
                </motion.p>
                <motion.p
                    className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto opacity-90"
                    variants={itemVariants}
                >
                    Transform your productivity with a seamless and intuitive task management experience.
                    From daily todos to grand projects, keep everything in sync and never miss a deadline.
                    Effortlessly manage your workflow and achieve your goals faster.
                </motion.p>
                <motion.div className="flex flex-col sm:flex-row justify-center gap-4 mb-12" variants={itemVariants}>
                    <Link
                        to="/login"
                        className="inline-block bg-white text-blue-700 font-bold px-8 py-4 rounded-full text-lg shadow-lg
                                   hover:bg-gray-100 hover:text-blue-800 transition-all duration-300 ease-in-out
                                   focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-600"
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                    >
                        Get Started - It's Free!
                    </Link>
                </motion.div>

                {/* Top 4 Selling Features */}
                <h2 className="text-3xl font-bold mb-8 drop-shadow-lg">Key Features at a Glance</h2>
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div className="flex flex-col items-center p-4 bg-white/10 rounded-xl shadow-md" variants={itemVariants}>
                        <Zap size={40} className="text-white mb-3 opacity-80" />
                        <h3 className="text-xl font-semibold mb-2">Seamless Task Management</h3>
                        <p className="text-sm opacity-80">Create, organize, and complete tasks with intuitive controls and quick actions.</p>
                    </motion.div>
                    <motion.div className="flex flex-col items-center p-4 bg-white/10 rounded-xl shadow-md" variants={itemVariants}>
                        <BellRing size={40} className="text-white mb-3 opacity-80" />
                        <h3 className="text-xl font-semibold mb-2">Smart Reminders & Deadlines</h3>
                        <p className="text-sm opacity-80">Set due dates and priorities to ensure you never miss an important task.</p>
                    </motion.div>
                    <motion.div className="flex flex-col items-center p-4 bg-white/10 rounded-xl shadow-md" variants={itemVariants}>
                        <FolderOpen size={40} className="text-white mb-3 opacity-80" />
                        <h3 className="text-xl font-semibold mb-2">Dedicated Project Spaces</h3>
                        <p className="text-sm opacity-80">Organize tasks within dedicated projects for better focus and clarity.</p>
                    </motion.div>
                    <motion.div className="flex flex-col items-center p-4 bg-white/10 rounded-xl shadow-md" variants={itemVariants}>
                        <TrendingUp size={40} className="text-white mb-3 opacity-80" />
                        <h3 className="text-xl font-semibold mb-2">Real-time Progress Tracking</h3>
                        <p className="text-sm opacity-80">Monitor subtask completion percentages and overall project progress.</p>
                    </motion.div>
                </motion.div>

                {/* App Screenshots Section */}
                <motion.div className="mt-16 text-center" variants={itemVariants}>
                    <h2 className="text-3xl font-bold mb-8 drop-shadow-lg">See Taskery in Action</h2>
                    <div className="flex flex-col gap-12"> {/* Changed to flex-col for vertical stacking */}
                        {/* Screenshot 1: Text Left, Image Right */}
                        <motion.div
                            variants={featureItemVariants}
                            className="flex flex-col md:flex-row items-center justify-center gap-8 bg-white/10 rounded-xl p-6 shadow-md"
                        >
                            <div className="md:w-1/2 text-left">
                                <h3 className="text-2xl font-semibold mb-3">Intuitive Search & Filtering</h3>
                                <p className="text-md opacity-85">Quickly find any task with powerful search capabilities. Filter by tags, or title .</p>
                            </div>
                            <div className="md:w-1/2">
                                <img
                                    src="/searchPage.png" // <--- CHANGE THIS URL TO YOUR APP SCREENSHOT 1
                                    alt="Taskery Search Page Screenshot"
                                    className="w-full h-auto rounded-lg shadow-xl border-2 border-white/20"
                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/CCCCCC/000000?text=Image+Error"; }}
                                />
                            </div>
                        </motion.div>

                        {/* Screenshot 2: Image Left, Text Right */}
                        <motion.div
                            variants={featureItemVariants}
                            className="flex flex-col md:flex-row-reverse items-center justify-center gap-8 bg-white/10 rounded-xl p-6 shadow-md"
                        >
                            <div className="md:w-1/2 text-left">
                                <h3 className="text-2xl font-semibold mb-3">Dedicated Project Workspaces</h3>
                                <p className="text-md opacity-85">Organize your tasks within dedicated project spaces. View all tasks related to a specific project, track progress, and manage deadlines effectively.</p>
                            </div>
                            <div className="md:w-1/2">
                                <img
                                    src="/dedicatedProjectTasks.png" // <--- CHANGE THIS URL TO YOUR APP SCREENSHOT 2
                                    alt="Taskery Dedicated Project Tasks Screenshot"
                                    className="w-full h-auto rounded-lg shadow-xl border-2 border-white/20"
                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/CCCCCC/000000?text=Image+Error"; }}
                                />
                            </div>
                        </motion.div>

                        {/* Screenshot 3: Text Left, Image Right */}
                        <motion.div
                            variants={featureItemVariants}
                            className="flex flex-col md:flex-row items-center justify-center gap-8 bg-white/10 rounded-xl p-6 shadow-md"
                        >
                            <div className="md:w-1/2 text-left">
                                <h3 className="text-2xl font-semibold mb-3">Detailed Task Management</h3>
                                <p className="text-md opacity-85">Dive deep into task details. Add subtasks, set priorities, attach notes, and mark completion to keep every aspect of your work organized.</p>
                            </div>
                            <div className="md:w-1/2">
                                <img
                                    src="/TaskDetails.png" // <--- CHANGE THIS URL TO YOUR APP SCREENSHOT 3
                                    alt="Taskery Task Details Screenshot"
                                    className="w-full h-auto rounded-lg shadow-xl border-2 border-white/20"
                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/CCCCCC/000000?text=Image+Error"; }}
                                />
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Testimonial/Social Proof Section */}
                <motion.div
                    className="mt-16 text-center"
                    variants={itemVariants}
                >
                    <h4 className="text-lg font-semibold mb-4 opacity-90">Join 2 or 3 of productive users already on Taskery!</h4>
                    <div className="flex justify-center items-center gap-2 text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={24} fill="currentColor" strokeWidth={0} />
                        ))}
                        <span className="text-white text-lg font-medium ml-2">4.9/5 Star Rating</span>
                    </div>
                    <p className="text-sm mt-4 opacity-75 italic">"Taskery has revolutionized how I manage my daily workflow. Absolutely essential!" - A Happy User</p>
                </motion.div>

                {/* Call to Action for specific features */}
                <motion.div className="mt-12 text-center" variants={itemVariants}>
                    <p className="text-md sm:text-lg opacity-85 mb-6">
                        Ready to take control of your tasks? Explore our features or dive right in!
                    </p>
                    <Link
                        to="/dashboard/inbox"
                        className="inline-block bg-purple-600 text-white font-bold px-8 py-4 rounded-full text-lg shadow-lg
                                   hover:bg-purple-700 transition-all duration-300 ease-in-out
                                   focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-600"
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                    >
                        Go to My Tasks
                    </Link>
                </motion.div>


                {/* Decorative Icons (positioned outside the main content card for more dynamic feel) */}
                <div className="absolute top-1/4 left-8 hidden md:block">
                    <motion.div variants={iconVariants}>
                        <CheckCircle size={64} className="text-white opacity-40" />
                    </motion.div>
                </div>
                <div className="absolute bottom-1/4 right-8 hidden md:block">
                    <motion.div variants={iconVariants}>
                        <Calendar size={64} className="text-white opacity-40" />
                    </motion.div>
                </div>
                <div className="absolute top-1/2 left-20 transform -translate-y-1/2 hidden md:block">
                    <motion.div variants={iconVariants}>
                        <FolderOpen size={64} className="text-white opacity-40" />
                    </motion.div>
                </div>
                {/* More decorative icons */}
                <div className="absolute top-1/3 right-12 hidden md:block">
                    <motion.div variants={iconVariants} initial={{ scale: 0, rotate: 90 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 1.5, type: "spring", stiffness: 100 }}>
                        <Zap size={56} className="text-white opacity-30" />
                    </motion.div>
                </div>
                <div className="absolute bottom-1/3 left-12 hidden md:block">
                    <motion.div variants={iconVariants} initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 1.7, type: "spring", stiffness: 100 }}>
                        <ListTree size={56} className="text-white opacity-30" />
                    </motion.div>
                </div>
                <div className="absolute top-[10%] left-[5%] hidden md:block">
                    <motion.div variants={iconVariants} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.0, type: "spring", stiffness: 100 }}>
                        <BellRing size={48} className="text-white opacity-20" />
                    </motion.div>
                </div>
                <div className="absolute bottom-[10%] right-[5%] hidden md:block">
                    <motion.div variants={iconVariants} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.2, type: "spring", stiffness: 100 }}>
                        <Users size={48} className="text-white opacity-20" />
                    </motion.div>
                </div>
            </motion.div>

            {/* Tailwind CSS custom keyframes for blob animation */}
            <style jsx>{`
                @keyframes blob {
                    0% {
                        transform: translate(0px, 0px) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                    100% {
                        transform: translate(0px, 0px) scale(1);
                    }
                }
                .animate-blob {
                    animation: blob 7s infinite cubic-bezier(0.6, 0.01, 0.4, 1);
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                .animation-delay-6000 {
                    animation-delay: 6s;
                }
            `}</style>
        </section>
    );
};

export default Hero;
