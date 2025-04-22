import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import ModalUser from '../components/ModalUser.jsx';
import { useUser } from '../context/UserContext.jsx';

function Header() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const userButtonRef = useRef(null);
    const { user, logout } = useUser();

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const response = await fetch('http://localhost:5277/api/auth/check', {
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error(`Ошибка сети: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                setIsAuthenticated(data.isAuthenticated);
            } catch (error) {
                console.error('Ошибка проверки авторизации:', error.message);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthentication();
    }, []);

    // Синхронизируем isAuthenticated с данными из UserContext
    useEffect(() => {
        if (user) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    }, [user]);

    const handleUserIconClick = () => {
        setIsModalOpen(true);
    };

    const handleLogout = async () => {
        try {
            await logout(); // Используем logout из UserContext
            setIsAuthenticated(false);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Ошибка при выходе:', error.message);
        }
    };

    if (isLoading) {
        return <div>Загрузка...</div>;
    }

    return (
        <header className="mainHeader">
            <div className="wrapper">
                <div className="mainHeader__logo">
                    <img src="/images/logo.png" alt="logo of company" />
                    <span>Fictoria</span>
                </div>
                <ul className='mainHeader__nav'>
                    <li>Моя лента</li>
                    <li><Link to="/">Вся лента</Link></li>
                    <li>Фильмы</li>
                    <li>Сериалы</li>
                    <li>Комиксы</li>
                    <li>Аниме</li>
                    <li>Манга</li>
                    <li>Другое</li>
                </ul>
                <div className="mainHeader__buttons">
                    <a href="#"><img src="/images/button_edit.png" alt="Button to edit" /></a>
                    <Link to="/search"><img src="/images/button_search.png" alt="Button to search" /></Link>
                    {isAuthenticated ? (
                        <button
                            className='header__user'
                            ref={userButtonRef}
                            onClick={handleUserIconClick}
                        >
                            <img
                                id='userHeader'
                                src={user?.avatarUrl || "/images/userIcon.png"}
                                alt="Иконка пользователя"
                            />
                        </button>
                    ) : (
                        <button className='header__login'>
                            <Link to="/login">Войти</Link>
                        </button>
                    )}
                </div>
            </div>
            <ModalUser
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onLogout={handleLogout}
            />
        </header>
    );
}

export default Header;