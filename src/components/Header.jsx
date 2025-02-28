import { Link } from 'react-router-dom';

function Header() {
    return (
        <>
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
                        <button className='header__login'><Link to="/login">Войти</Link></button>
                        <button className='header__user'><img id='userHeader' src="/images/userIcon.png" alt="Иконка пользователя" /></button>
                    </div>
                </div>
            </header>
        </>
    )
}

export default Header;