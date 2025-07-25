import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const useProfileSettings = () => {
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        avatarUrl: ''
    });
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [profileError, setProfileError] = useState(null);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchProfile = async () => {
            setLoadingProfile(true);
            setProfileError(null);
            try {
                if (!token) {
                    setProfileError('Authentication token not found. Please log in.');
                    setLoadingProfile(false);
                    return;
                }
                const res = await axios.get(`${API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProfileData({
                    firstName: res.data.firstName || '',
                    lastName: res.data.lastName || '',
                    email: res.data.email || '',
                    avatarUrl: res.data.avatarUrl || ''
                });
            } catch (err) {
                console.error('Failed to fetch profile:', err);
                setProfileError(err.response?.data?.message || 'Failed to load profile data.');
            } finally {
                setLoadingProfile(false);
            }
        };
        fetchProfile();
    }, [token]);

    const handleProfileChange = (e) => {
        const { id, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoadingProfile(true);
        setProfileError(null);

        try {
            if (!token) {
                setProfileError('Authentication token not found. Please log in.');
                setLoadingProfile(false);
                return;
            }

            const res = await axios.put(`${API_URL}/auth/me`, profileData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfileData(prev => ({
                ...prev,
                firstName: res.data.user.firstName,
                lastName: res.data.user.lastName,
                email: res.data.user.email,
                avatarUrl: res.data.user.avatarUrl
            }));
            toast.success("Profile Updated!");
        } catch (err) {
            console.error('Failed to update profile:', err);
            setProfileError(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setLoadingProfile(false);
        }
    };

    return {
        profileData,
        loadingProfile,
        profileError,
        handleProfileChange,
        handleProfileSubmit
    };
};

export default useProfileSettings;