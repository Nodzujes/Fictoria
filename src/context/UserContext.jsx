/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';

export const UserContext = createContext({
    user: null,
    loading: true,
    login: () => {},
    logout: () => {},
    setUser: () => {},
    fetchUserProfile: () => {},
});

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Проверяем статус авторизации при загрузке приложения
    useEffect(() => {
        const checkAuth = async (retryCount = 0, maxRetries = 2) => {
            try {
                console.log('Checking auth, attempt:', retryCount + 1);
                const response = await fetch('http://localhost:5277/api/auth/me', {
                    method: 'GET',
                    credentials: 'include',
                });
                console.log('Auth check response:', response.status, 'ok:', response.ok);
                const data = await response.json();
                console.log('Auth check data:', data);
                if (response.ok && data.id) {
                    setUser({
                        id: data.id,
                        nickname: data.nickname,
                        avatarUrl: data.avatarUrl,
                        email: data.email,
                        name: data.name,
                        status: data.status,
                        categories: data.categories,
                        is_admin: data.is_admin, // Добавлено
                    });
                } else {
                    console.warn('Auth failed, user not authenticated');
                    setUser(null);
                }
            } catch (error) {
                console.error('Ошибка проверки авторизации:', error);
                if (retryCount < maxRetries) {
                    console.log('Retrying auth check...');
                    setTimeout(() => checkAuth(retryCount + 1, maxRetries), 500);
                    return;
                }
                setUser(null);
            } finally {
                if (retryCount === 0 || retryCount >= maxRetries) {
                    setLoading(false);
                    console.log('Auth check complete, loading:', false, 'user:', user);
                }
            }
        };
        checkAuth();
    }, []);

    // Функция для входа
    const login = async (email, password, recaptchaToken) => {
        try {
            const response = await fetch('http://localhost:5277/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, recaptchaToken }),
                credentials: 'include',
            });
            const data = await response.json();
            console.log('Login response in UserContext:', data);
            if (response.ok) {
                const newUser = {
                    id: data.id,
                    nickname: data.nickname,
                    avatarUrl: data.avatarUrl,
                    email: data.email,
                    name: data.name,
                    status: data.status,
                    categories: data.categories,
                    is_admin: data.is_admin, // Добавлено
                };
                setUser(newUser);
                return data;
            } else {
                throw new Error(data.message || 'Ошибка авторизации');
            }
        } catch (error) {
            console.error('Ошибка входа:', error);
            throw error;
        }
    };

    // Функция для выхода
    const logout = async () => {
        try {
            const response = await fetch('http://localhost:5277/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
            console.log('Logout response:', response.status);
            if (response.ok) {
                setUser(null);
                console.log('User cleared after logout');
            } else {
                const data = await response.json();
                throw new Error(data.message || 'Ошибка выхода');
            }
        } catch (error) {
            console.error('Ошибка выхода:', error);
            throw error;
        }
    };

    // Функция для получения профиля пользователя
    const fetchUserProfile = async () => {
        try {
            const response = await fetch('http://localhost:5277/api/auth/profile', {
                method: 'GET',
                credentials: 'include',
            });
            console.log('Fetch user profile response:', response.status);
            const data = await response.json();
            console.log('Fetch user profile data:', data);
            if (response.ok) {
                setUser({
                    id: data.id,
                    nickname: data.nickname,
                    avatarUrl: data.avatarUrl,
                    email: data.email,
                    name: data.name,
                    status: data.status,
                    categories: data.categories,
                    is_admin: data.is_admin, // Добавлено
                });
            } else {
                throw new Error(data.message || 'Ошибка получения профиля');
            }
        } catch (error) {
            console.error('Ошибка получения профиля:', error);
            setUser(null);
        }
    };

    return (
        <UserContext.Provider value={{ user, loading, login, logout, setUser, fetchUserProfile }}>
            {children}
        </UserContext.Provider>
    );
}

UserProvider.propTypes = {
    children: PropTypes.node.isRequired,
};