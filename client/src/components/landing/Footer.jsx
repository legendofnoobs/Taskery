import React from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Github, Linkedin, Twitter, Mail } from 'lucide-react'; // Social media icons

const Footer = () => {
    const footerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                delay: 0.2,
                duration: 0.6,
                ease: "easeOut",
            },
        },
    };

    const linkVariants = {
        hover: { scale: 1.05, color: '#6366f1' }, // Indigo-500 equivalent
        tap: { scale: 0.95 },
    };

    const socialIconVariants = {
        hover: { scale: 1.2, color: '#8b5cf6' }, // Purple-500 equivalent
        tap: { scale: 0.9 },
    };

    return (
        <motion.footer
            className="bg-gray-900 text-gray-300 py-10 px-6 sm:px-10 border-t border-gray-800"
            variants={footerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 text-center md:text-left">
                {/* Brand Info */}
                <div className="col-span-full md:col-span-1">
                    <motion.h3
                        className="text-2xl font-bold text-white mb-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        Taskery
                    </motion.h3>
                    <p className="text-sm leading-relaxed opacity-80">
                        Your ultimate productivity partner. Organize, track, and achieve your goals with ease.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
                    <ul className="space-y-2">
                        <li>
                            <motion.div variants={linkVariants} whileHover="hover" whileTap="tap">
                                <Link to="/features" className="hover:text-indigo-400 transition-colors">Features</Link>
                            </motion.div>
                        </li>
                        <li>
                            <motion.div variants={linkVariants} whileHover="hover" whileTap="tap">
                                <Link to="/pricing" className="hover:text-indigo-400 transition-colors">Pricing</Link>
                            </motion.div>
                        </li>
                        <li>
                            <motion.div variants={linkVariants} whileHover="hover" whileTap="tap">
                                <Link to="/contact" className="hover:text-indigo-400 transition-colors">Contact Us</Link>
                            </motion.div>
                        </li>
                        <li>
                            <motion.div variants={linkVariants} whileHover="hover" whileTap="tap">
                                <Link to="/blog" className="hover:text-indigo-400 transition-colors">Blog</Link>
                            </motion.div>
                        </li>
                    </ul>
                </div>

                {/* Legal & Support */}
                <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Legal & Support</h4>
                    <ul className="space-y-2">
                        <li>
                            <motion.div variants={linkVariants} whileHover="hover" whileTap="tap">
                                <Link to="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link>
                            </motion.div>
                        </li>
                        <li>
                            <motion.div variants={linkVariants} whileHover="hover" whileTap="tap">
                                <Link to="/terms" className="hover:text-indigo-400 transition-colors">Terms of Service</Link>
                            </motion.div>
                        </li>
                        <li>
                            <motion.div variants={linkVariants} whileHover="hover" whileTap="tap">
                                <Link to="/faq" className="hover:text-indigo-400 transition-colors">FAQ</Link>
                            </motion.div>
                        </li>
                    </ul>
                </div>

                {/* Connect With Us */}
                <div className="col-span-full lg:col-span-1 md:col-span-1">
                    <h4 className="text-lg font-semibold text-white mb-4">Connect With Us</h4>
                    <div className="flex justify-center md:justify-start space-x-4 mb-6">
                        <motion.a
                            href="https://github.com/your-taskery-repo"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-purple-500 transition-colors"
                            variants={socialIconVariants}
                            whileHover="hover"
                            whileTap="tap"
                            aria-label="GitHub"
                        >
                            <Github size={24} />
                        </motion.a>
                        <motion.a
                            href="https://linkedin.com/your-taskery-page"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-purple-500 transition-colors"
                            variants={socialIconVariants}
                            whileHover="hover"
                            whileTap="tap"
                            aria-label="LinkedIn"
                        >
                            <Linkedin size={24} />
                        </motion.a>
                        <motion.a
                            href="https://twitter.com/your-taskery-handle"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-purple-500 transition-colors"
                            variants={socialIconVariants}
                            whileHover="hover"
                            whileTap="tap"
                            aria-label="Twitter"
                        >
                            <Twitter size={24} />
                        </motion.a>
                        <motion.a
                            href="mailto:support@taskery.com"
                            className="text-gray-400 hover:text-purple-500 transition-colors"
                            variants={socialIconVariants}
                            whileHover="hover"
                            whileTap="tap"
                            aria-label="Email"
                        >
                            <Mail size={24} />
                        </motion.a>
                    </div>
                    <p className="text-sm opacity-70">Stay updated with Taskery news and tips.</p>
                </div>
            </div>

            {/* Copyright */}
            <div className="mt-8 pt-6 border-t border-gray-800 text-center text-sm text-gray-500">
                © {new Date().getFullYear()} Taskery. All rights reserved.
            </div>
        </motion.footer>
    );
};

export default Footer;
