import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'; // Import necessary icons
import 'react-big-calendar/lib/css/react-big-calendar.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Custom Toolbar Component
const CustomToolbar = ({ label, onNavigate, onView, view }) => {
    return (
        <div className="rbc-toolbar">
            <span className="rbc-toolbar-label">
                {label}
            </span>

            <div className="rbc-btn-group">
                <button
                    type="button"
                    onClick={() => onNavigate('PREV')}
                    aria-label="Previous"
                >
                    <ChevronLeft size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => onNavigate('TODAY')}
                >
                    Today
                </button>
                <button
                    type="button"
                    onClick={() => onNavigate('NEXT')}
                    aria-label="Next"
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            <div className="rbc-btn-group">
                <button
                    type="button"
                    onClick={() => onView('month')}
                    className={view === 'month' ? 'rbc-active' : ''}
                >
                    Month
                </button>
                <button
                    type="button"
                    onClick={() => onView('week')}
                    className={view === 'week' ? 'rbc-active' : ''}
                >
                    Week
                </button>
                <button
                    type="button"
                    onClick={() => onView('day')}
                    className={view === 'day' ? 'rbc-active' : ''}
                >
                    Day
                </button>
                <button
                    type="button"
                    onClick={() => onView('agenda')}
                    className={view === 'agenda' ? 'rbc-active' : ''}
                >
                    Agenda
                </button>
            </div>
        </div>
    );
};

// Custom Event Component
const CustomEvent = ({ event }) => {
    return (
        <div className="rbc-event">
            <span className="rbc-event-content">{event.title}</span>
        </div>
    );
};

// Custom Header Component (for day names like Mon, Tue)
const CustomHeader = ({ label }) => {
    return (
        <div className="rbc-header-custom">
            {label}
        </div>
    );
};

// Custom Date Cell Wrapper for background styling
const CustomDateCellWrapper = ({ children, value }) => {
    const today = moment().startOf('day');
    const cellDate = moment(value).startOf('day');

    let className = 'rbc-day-bg-custom';

    if (cellDate.isSame(today, 'day')) {
        className += ' rbc-today-custom';
    } else if (cellDate.month() !== today.month()) { // Check if it's an off-range month day
        className += ' rbc-off-range-bg-custom';
    }

    return <div className={className}>{children}</div>;
};


const CalendarView = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTasks = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/tasks`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTasks(response.data);
            } catch (err) {
                console.error('Error fetching tasks:', err);
                setError('Failed to load tasks for calendar.');
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    const localizer = momentLocalizer(moment); // Initialize the moment adapter

    // Filter out tasks without a valid dueDate before mapping to events
    const events = tasks
        .filter(task => task.dueDate && !isNaN(new Date(task.dueDate).getTime()))
        .map(task => ({
            title: task.content,
            start: new Date(task.dueDate),
            end: new Date(task.dueDate),
        }));

    return (
        <div className="md:ml-72 mt-8 px-4 py-6">
            {/* Fixed Header for Calendar View Title */}
            <div className="fixed top-0 left-0 right-0 md:left-72 z-10 bg-white/50 dark:bg-zinc-900/50 px-4 py-6 flex items-center justify-between backdrop-blur-md">
                <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white ml-12 md:ml-0">
                    <CalendarDays className="w-6 h-6" /> Calendar View
                </h1>
            </div>

            {/* Spacer div to prevent content from being hidden behind the fixed header */}
            <div className="pt-10 pb-4"> {/* Adjusted padding to accommodate header */}
                {loading ? (
                    <div className="text-gray-900 dark:text-white opacity-70">Loading calendar...</div>
                ) : error ? (
                    <div className="text-red-500">{error}</div>
                ) : (
                    <div className="bg-zinc-800 rounded-xl shadow-lg p-4 sm:p-6 h-[calc(100vh-200px)]"> {/* Adjusted height */}
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: '100%', width: '100%' }} // Calendar takes full height of its container
                            views={['month', 'week', 'day', 'agenda']} // Enable different views
                            defaultView="month" // Set default view
                            components={{
                                toolbar: CustomToolbar,
                                event: CustomEvent,
                                header: CustomHeader, // For day names
                                dateCellWrapper: CustomDateCellWrapper, // For cell backgrounds
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalendarView;
