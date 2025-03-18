import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

function ModalUser({ isOpen, onClose, onLogout }) {
    const handleOutsideClick = (event) => {
        if (event.target.className === 'modal--close') {
            onClose();
        }
    };

    const handleLogoutClick = () => {
        onLogout(); // Вызываем функцию выхода
    };

    if (!isOpen) return null;

    return (
        <div className="modal--close" onClick={handleOutsideClick}>
            <div id="modalUser">
                <div className="wrapper-modal">
                    <div className="top">
                        <div className="top__user-info">
                            <img id="userIconModal" src="/images/userIcon.png" alt="иконка пользователя" />
                            <span id="userNameModal">Keanu_Reeves</span>
                        </div>
                        <div className="top__user-status">
                            <span id="UserRealName">Киану Ривз</span>
                            <span id="UserStatus">Снимался в матрице</span>
                        </div>
                    </div>
                    <Link to="/user"><img src="/icons/user.png" alt="иконка для кнопки" /><span>Мой профиль</span></Link>
                    <a href="#"><img src="/icons/settings.png" alt="иконка настроек" /><span>Настройки</span></a>
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