import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const usePasswordSecurity = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState(null);

    const token = localStorage.getItem('token');

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setLoadingPassword(true);
        setPasswordError(null);

        if (newPassword !== confirmNewPassword) {
            setPasswordError('New password and confirmation do not match.');
            setLoadingPassword(false);
            return;
        }

        try {
            if (!token) {
                setPasswordError('Authentication token not found. Please log in.');
                setLoadingPassword(false);
                return;
            }

            // eslint-disable-next-line no-unused-vars
            const res = await axios.put(`${API_URL}/auth/me`, {
                currentPassword,
                password: newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Password Updated!");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (err) {
            console.error('Failed to change password:', err);
            setPasswordError(err.response?.data?.message || 'Failed to change password. Please check your current password.');
        } finally {
            setLoadingPassword(false);
        }
    };

    return {
        currentPassword,
        setCurrentPassword,
        newPassword,
        setNewPassword,
        confirmNewPassword,
        setConfirmNewPassword,
        loadingPassword,
        passwordError,
        handlePasswordChange
    };
};

export default usePasswordSecurity;