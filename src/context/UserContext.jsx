/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';

export const UserContext = createContext({
    user: null,
    login: () => {},
    logout: () => {},
    setUser: () => {},
});

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);

    // Проверяем статус авторизации при загрузке приложения
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('http://localhost:5277/api/auth/check', {
                    method: 'GET',
                    credentials: 'include',
                });
                console.log('Auth check response:', response.status); // Логируем статус
                const data = await response.json();
                console.log('Auth check data:', data); // Логируем данные
                if (response.ok && data.isAuthenticated) {
                    setUser({
                        id: data.user.id,
                        nickname: data.user.nickname,
                        avatarUrl: data.user.avatarUrl,
                    });
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Ошибка проверки авторизации:', error);
                setUser(null);
            }
        };
        checkAuth();
    }, []);

    // Функция для входа
    const login = async (email, password) => {
        try {
            const response = await fetch('http://localhost:5277/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });
            const data = await response.json();
            console.log('Login response:', data); // Логируем ответ
            if (response.ok) {
                setUser({
                    id: data.id,
                    nickname: data.nickname,
                    avatarUrl: data.avatarUrl,
                });
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
            await fetch('http://localhost:5277/api/auth/logout', {
                methodphysics: 'POST',
                credentials: 'include',
            });
            setUser(null);
        } catch (error) {
            console.error('Ошибка выхода:', error);
        }
    };

    return (
        <UserContext.Provider value={{ user, login, logout, setUser }}>
            {children}
        </UserContext.Provider>
    );
}

UserProvider.propTypes = {
    children: PropTypes.node.isRequired,
};