import { NavLink, Link } from 'react-router-dom';
import { useState, useRef } from 'react';
import ModalUser from '../components/ModalUser.jsx';
import { useUser } from '../context/UserContext.jsx';

function Footer() {
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
        <>
            <footer>
                <div className="wrapper">
                    <div className="footer__user block">
                        <div className="footer__titel">Ваш профиль</div>
                        <ul>
                            <li><Link to="/user">Профиль</Link></li>
                            <li><Link to="/setings">Настройки</Link></li>
                            <li><Link to="/login">Авторизация</Link></li>
                            <li><Link to="/reg">Регистрация</Link></li>
                        </ul>
                    </div>
                    <div className="footer__nav block">
                        <div className="footer__titel">Разделы</div>
                        <ul>
                            <li><Link to="/category/Моя лента">Моя лента</Link></li>
                            <li><Link to="/">Вся лента</Link></li>
                            <li><Link to="/category/Фильмы">Фильмы</Link></li>
                            <li><Link to="/category/Сериалы">Сериалы</Link></li>
                            <li><Link to="/category/Комиксы">Комиксы</Link></li>
                            <li><Link to="/category/Аниме">Аниме</Link></li>
                            <li><Link to="/category/Манга">Манга</Link></li>
                            <li><Link to="/category/Другое">Другое</Link></li>
                        </ul>
                    </div>
                    <div className="footer__user block">
                        <div className="footer__titel">Контакты</div>
                        <ul>
                            <li><a href="mailto:fictoriacompany@gmail.com">Fictoriacompany@gmail.com</a></li>
                            <li><a href="mailto:fictoriacompany@gmail.com">QUAfictoria@gmail.com</a></li>
                            <li><a href="mailto:fictoriacompany@gmail.com">vakansii@gmail.com</a></li>
                            <li><a href="tel:+79258889090">+7 (925) 888 90 90</a></li>
                        </ul>
                    </div>
                    <div className="footer__social block">
                        <div className="footer__titel">Социальные сети</div>
                        <div className="footer__social--links">
                            <a href=""><img src="/icons/vk.png" alt="vk icon" />ВКонтакте</a>
                            <a href=""><img src="/icons/tg.png" alt="tg icon" />Телеграмм</a>
                            <a href=""><img src="/icons/yt.png" alt="yt icon" />YouTube</a>
                        </div>
                    </div>
                </div>
                <div className="wrapper__mobile">
                    <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
                        {({ isActive }) => (
                            <img
                                className="footer_home"
                                src={isActive ? "/icons/home-active.png" : "/icons/home-page.png"}
                                alt="иконка главной страницы"
                            />
                        )}
                    </NavLink>
                    <NavLink to="/search" className={({ isActive }) => (isActive ? 'active' : '')}>
                        {({ isActive }) => (
                            <img
                                className="footer_search"
                                src={isActive ? "/icons/search-active.png" : "/icons/search-line.png"}
                                alt="иконка поиска"
                            />
                        )}
                    </NavLink>
                    <NavLink to="/creator" className={({ isActive }) => (isActive ? 'active' : '')}>
                        {({ isActive }) => (
                            <img
                                className="footer_edit"
                                src={isActive ? "/icons/edit-active.png" : "/icons/edit-line.png"}
                                alt="иконка перехода на конструктор"
                            />
                        )}
                    </NavLink>
                    <NavLink to="/setings" className={({ isActive }) => (isActive ? 'active' : '')}>
                        {({ isActive }) => (
                            <img
                                className="footer_setings"
                                src={isActive ? "/icons/settings-active.png" : "/icons/settings-line.png"}
                                alt="иконка настроек"
                            />
                        )}
                    </NavLink>
                    {user ? (
                        <button
                            className="header__user"
                            ref={userButtonRef}
                            onClick={handleUserIconClick}
                        >
                            <img
                                id="userHeader"
                                src={user.avatarUrl || "/images/userIcon.png"}
                                alt="Иконка пользователя"
                            />
                        </button>
                    ) : (
                        <NavLink to="/login" className={({ isActive }) => (isActive ? 'active' : '')}>
                            {({ isActive }) => (
                                <img
                                    src={isActive ? "/icons/user-active.png" : "/icons/user-line.png"}
                                    alt="иконка входа"
                                />
                            )}
                        </NavLink>
                    )}
                </div>
                <ModalUser
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onLogout={handleLogout}
                />
            </footer>
        </>
    );
}

export default Footer;