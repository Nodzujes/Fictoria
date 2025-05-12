import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext.jsx';

function ModalUser({ isOpen, onClose, onLogout }) {
    const { user } = useUser();

    const handleOutsideClick = (event) => {
        if (event.target.className === 'modal--close') {
            onClose();
        }
    };

    const handleLogoutClick = () => {
        onLogout();
    };

    if (!isOpen) return null;

    return (
        <div className="modal--close" onClick={handleOutsideClick}>
            <div id="modalUser">
                <div className="wrapper-modal">
                    <div className="top">
                        <div className="top__user-info">
                            <img
                                id="userIconModal"
                                src={user?.avatarUrl || "/images/userIcon.png"}
                                alt="иконка пользователя"
                            />
                            <span id="userNameModal">{user?.nickname || "Гость"}</span>
                        </div>
                        <div className="top__user-status">
                            <span id="UserRealName">{user?.name || "Имя не указано"}</span>
                            <span id="UserStatus">{user?.status || "Статус не указан"}</span>
                        </div>
                    </div>
                    <Link to="/user"><img src="/icons/user.png" alt="иконка для кнопки" /><span>Мой профиль</span></Link>
                    <Link to="/setings"><img src="/icons/settings.png" alt="иконка настроек" /><span>Настройки</span></Link>
                    {!!user?.is_admin && (
                        <>
                            <Link to="/admin"><img src="/icons/adminPanel.png" alt="иконка настроек" /><span>Админ-панель</span></Link>
                            <Link to="/admin-metric"><img src="/icons/statistic.png" alt="иконка настроек" /><span>Статистика</span></Link>
                        </>
                    )}
                    <button className="logout__btn" onClick={handleLogoutClick}>
                        <img src="/icons/logout.png" alt="иконка выхода" />
                        <span>Выйти</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

ModalUser.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onLogout: PropTypes.func.isRequired,
};

export default ModalUser;