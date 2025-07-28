/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle, Calendar, FolderOpen, Zap, BellRing, Users, ListTree, Activity, Star,
    User, Award, Search, Heart, TrendingUp, Lock, Briefcase, Inbox,
    Tag, LayoutGrid, Download, Share2, Settings, BarChart
} from 'lucide-react';

const Features = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.06,
                delayChildren: 0.08,
            },
        },
    };

    const featureItemVariants = {
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
        <section className="py-16 bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <motion.h2
                    className="text-4xl font-extrabold mb-12 drop-shadow-lg text-blue-300"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    Discover All Taskery Features
                </motion.h2>

                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div className="flex flex-col items-center p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 transition-all duration-300" variants={featureItemVariants}>
                        <Zap size={48} className="text-blue-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Seamless Task Management</h3>
                        <p className="text-sm opacity-80">Create, organize, and complete tasks with intuitive controls and quick actions.</p>
                    </motion.div>
                    <motion.div className="flex flex-col items-center p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 transition-all duration-300" variants={featureItemVariants}>
                        <ListTree size={48} className="text-purple-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Organize with Subtasks</h3>
                        <p className="text-sm opacity-80">Break down big goals into manageable steps with multi-level subtasks.</p>
                    </motion.div>
                    <motion.div className="flex flex-col items-center p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 transition-all duration-300" variants={featureItemVariants}>
                        <BellRing size={48} className="text-green-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Smart Reminders & Deadlines</h3>
                        <p className="text-sm opacity-80">Set due dates and priorities to ensure you never miss an important task.</p>
                    </motion.div>
                    <motion.div className="flex flex-col items-center p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 transition-all duration-300" variants={featureItemVariants}>
                        <Activity size={48} className="text-yellow-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Comprehensive Activity Logs</h3>
                        <p className="text-sm opacity-80">Keep track of all changes and progress within your tasks and projects.</p>
                    </motion.div>
                    <motion.div className="flex flex-col items-center p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 transition-all duration-300" variants={featureItemVariants}>
                        <User size={48} className="text-red-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Personalized Profiles</h3>
                        <p className="text-sm opacity-80">Manage your profile, update details, and personalize your Taskery experience.</p>
                    </motion.div>
                    <motion.div className="flex flex-col items-center p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 transition-all duration-300" variants={featureItemVariants}>
                        <FolderOpen size={48} className="text-indigo-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Dedicated Project Spaces</h3>
                        <p className="text-sm opacity-80">Organize tasks within dedicated projects for better focus and clarity.</p>
                    </motion.div>
                    <motion.div className="flex flex-col items-center p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 transition-all duration-300" variants={featureItemVariants}>
                        <Heart size={48} className="text-pink-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Favorite Projects</h3>
                        <p className="text-sm opacity-80">Quickly access your most important projects by marking them as favorites.</p>
                    </motion.div>
                    <motion.div className="flex flex-col items-center p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 transition-all duration-300" variants={featureItemVariants}>
                        <Search size={48} className="text-cyan-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Powerful Task Search</h3>
                        <p className="text-sm opacity-80">Find any task instantly with robust search capabilities across your projects.</p>
                    </motion.div>
                    <motion.div className="flex flex-col items-center p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 transition-all duration-300" variants={featureItemVariants}>
                        <TrendingUp size={48} className="text-orange-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Real-time Progress Tracking</h3>
                        <p className="text-sm opacity-80">Monitor subtask completion percentages and overall project progress.</p>
                    </motion.div>
                    <motion.div className="flex flex-col items-center p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 transition-all duration-300" variants={featureItemVariants}>
                        <Lock size={48} className="text-teal-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Secure Authentication</h3>
                        <p className="text-sm opacity-80">Your data is safe with robust user registration and login systems.</p>
                    </motion.div>
                    <motion.div className="flex flex-col items-center p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 transition-all duration-300" variants={featureItemVariants}>
                        <Briefcase size={48} className="text-lime-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Dynamic Project Management</h3>
                        <p className="text-sm opacity-80">Create, update, and delete projects as your needs evolve.</p>
                    </motion.div>
                    <motion.div className="flex flex-col items-center p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 transition-all duration-300" variants={featureItemVariants}>
                        <Inbox size={48} className="text-fuchsia-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Centralized Inbox</h3>
                        <p className="text-sm opacity-80">Capture quick thoughts and tasks in your personal Inbox for later organization.</p>
                    </motion.div>
                    <motion.div className="flex flex-col items-center p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 transition-all duration-300" variants={featureItemVariants}>
                        <Tag size={48} className="text-rose-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Task Tagging & Categories</h3>
                        <p className="text-sm opacity-80">Organize tasks with custom tags and categories for easy filtering and grouping.</p>
                    </motion.div>
                    <motion.div className="flex flex-col items-center p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 transition-all duration-300" variants={featureItemVariants}>
                        <LayoutGrid size={48} className="text-emerald-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Customizable Views</h3>
                        <p className="text-sm opacity-80">Switch between list, board, or calendar views to suit your preferred workflow.</p>
                        <div className='mt-2'>(Coming Soon)</div>
                    </motion.div>
                    <motion.div className="flex flex-col items-center p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 transition-all duration-300" variants={featureItemVariants}>
                        <Download size={48} className="text-sky-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Easy Data Export</h3>
                        <p className="text-sm opacity-80">Export your tasks and project data in various formats for backup or reporting.</p>
                        <div className='mt-2'>(Coming Soon)</div>
                    </motion.div>
                    <motion.div className="flex flex-col items-center p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 transition-all duration-300" variants={featureItemVariants}>
                        <Share2 size={48} className="text-violet-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Seamless Sharing</h3>
                        <p className="text-sm opacity-80">Share tasks or projects with others for collaborative work and team efficiency.</p>
                        <div className='mt-2'>(Coming Soon)</div>
                    </motion.div>
                    <motion.div className="flex flex-col items-center p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 transition-all duration-300" variants={featureItemVariants}>
                        <Settings size={48} className="text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Advanced Settings</h3>
                        <p className="text-sm opacity-80">Tailor Taskery to your needs with extensive customization options.</p>
                        <div className='mt-2'>(Coming Soon)</div>
                    </motion.div>
                    <motion.div className="flex flex-col items-center p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 transition-all duration-300" variants={featureItemVariants}>
                        <BarChart size={48} className="text-blue-200 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Productivity Reports</h3>
                        <p className="text-sm opacity-80">Gain insights into your productivity with detailed progress reports and analytics.</p>
                        <div className='mt-2'>(Coming Soon)</div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default Features;
