import { NavLink, Link } from 'react-router-dom';
import { useState, useRef } from 'react';
import ModalUser from '../components/ModalUser.jsx';
import { useUser } from '../context/UserContext.jsx';

function Header() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const userButtonRef = useRef(null);
    const { user, logout, isLoading } = useUser();

    const handleUserIconClick = () => {
        setIsModalOpen(true);
    };

    const handleLogout = async () => {
        try {
            await logout();
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
                    {user && (
                        <li><NavLink to="/category/Моя лента">Моя лента</NavLink></li>
                    )}
                    <li><NavLink to="/">Вся лента</NavLink></li>
                    <li><NavLink to="/category/Фильмы">Фильмы</NavLink></li>
                    <li><NavLink to="/category/Сериалы">Сериалы</NavLink></li>
                    <li><NavLink to="/category/Комиксы">Комиксы</NavLink></li>
                    <li><NavLink to="/category/Аниме">Аниме</NavLink></li>
                    <li><NavLink to="/category/Манга">Манга</NavLink></li>
                    <li><NavLink to="/category/Другое">Другое</NavLink></li>
                </ul>
                <div className="mainHeader__buttons">
                    <Link to="/creator"><img src="/images/button_edit.png" alt="Button to edit" /></Link>
                    <Link to="/search"><img src="/images/button_search.png" alt="Button to search" /></Link>
                    {user ? (
                        <button
                            className='header__user'
                            ref={userButtonRef}
                            onClick={handleUserIconClick}
                        >
                            <img
                                id='userHeader'
                                src={user.avatarUrl || "/images/userIcon.png"}
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