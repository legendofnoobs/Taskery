import { useState } from 'react';
import toast from 'react-hot-toast';
// import axios from 'axios';
// import toast from 'react-hot-toast';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const useNotificationSettings = () => {
    // Add states for notification preferences if they become dynamic
    const [emailNotifications, setEmailNotifications] = useState(false);
    const [pushNotifications, setPushNotifications] = useState(false);

    // This function would typically interact with an API
    const saveNotificationPreferences = () => {
        // console.log('Saving notification preferences:', { emailNotifications, pushNotifications });
        // Example API call:
        // try {
        //     await axios.put(`${API_URL}/user/notifications`, { emailNotifications, pushNotifications }, {
        //         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        //     });
        //     toast.success('Notification preferences saved!');
        // } catch (error) {
        //     toast.error('Failed to save notification preferences.');
        // }
        toast.success('Notification preferences saved! (Dummy action)');
    };

    return {
        emailNotifications,
        setEmailNotifications,
        pushNotifications,
        setPushNotifications,
        saveNotificationPreferences
    };
};

export default useNotificationSettings;