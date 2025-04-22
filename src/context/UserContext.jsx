import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);

    const fetchUserProfile = async () => {
        try {
            const response = await fetch('http://localhost:5277/api/auth/profile', {
                method: 'GET',
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setUser(data);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Ошибка при получении профиля:', error);
            setUser(null);
        }
    };

    const logout = async () => {
        try {
            await fetch('http://localhost:5277/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
            setUser(null);
        } catch (error) {
            console.error('Ошибка при выходе:', error);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, fetchUserProfile, logout }}>
            {children}
        </UserContext.Provider>
    );
}

UserProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export function useUser() {
    return useContext(UserContext);
}