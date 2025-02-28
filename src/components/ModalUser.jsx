import { useEffect } from 'react';
import { Link } from 'react-router-dom';

function ModalUser() {
    useEffect(()=>{
        const userIcon = document.querySelector(".header__user");
        const modal = document.querySelector(".modal--close");

        userIcon.addEventListener('click', () =>{
            modal.classList.add('active');
        });

        window.addEventListener('click', (event) =>{
            if (event.target === modal) {
                modal.classList.remove('active');
            }
        });
    }, []);

    return (
        <>
            <div className="modal--close">
                <div id="modalUser">
                    <div className="wrapper">
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
                        <button className="logout__btn"><img src="/icons/logout.png" alt="иконка выхода" /><span>Выйти</span></button>
                    </div>
                </div>
            </div>
        </>
    )
};

export default ModalUser;