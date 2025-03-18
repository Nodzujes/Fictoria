import { Link } from 'react-router-dom';

function Footer() {
    return (
        <>
            <footer>
                <div className="wrapper">
                    <div className="footer__user block">
                        <div className="footer__titel">Ваш профиль</div>
                        <ul>
                            <li><Link to="/user">Профиль</Link></li>
                            <li><Link to="/setings">Настройки</Link></li>
                            <li>Авторизация</li>
                            <li>Регистрация</li>
                        </ul>
                    </div>
                    <div className="footer__nav block">
                        <div className="footer__titel">Разделы</div>
                        <ul>
                            <li>Моя лента</li>
                            <li>Вся лента</li>
                            <li>Фильмы</li>
                            <li>Сериалы</li>
                            <li>Комиксы</li>
                            <li>Аниме</li>
                            <li>Манга</li>
                            <li>Другое</li>
                        </ul>
                    </div>
                    <div className="footer__user block">
                        <div className="footer__titel">Контакты</div>
                        <ul>
                            <li><a href="mailto:Companyname@gmail.com">Companyname@gmail.com</a></li>
                            <li><a href="mailto:Questionsname@gmail.com">Questionsname@gmail.com</a></li>
                            <li><a href="mailto:vakansii@gmail.com">vakansii@gmail.com</a></li>
                            <li><a href="tel:+79258889090">+7 (925) 888 90 90</a></li>
                        </ul>
                    </div>
                    <div className="footer__social block">
                        <div className="footer__titel">Социальные сети</div>
                        <div className="footer__social--links">
                            <a href=""><img src="/icons/vk.png" alt="vk icon" />ВКонтакте</a>
                            <a href=""><img src="/icons/tg.png" alt="tg icon" />Телеграмм</a>
                            <a href=""><img src="/icons/yt.png" alt="tg icon" />YouTube</a>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Footer;