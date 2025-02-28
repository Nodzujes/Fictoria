import { Link } from 'react-router-dom';

function UserPage() {
    return (
        <>
            <section className="content">
                <div className="content-blog indent">
                    <div className="content__header"><h1>Профиль</h1></div>
                    <div className="user__account-block">
                        <img src="/images/userIcon.png" alt="user icon" />
                        <div className="user__account-block-txt">
                            <span id='userNickname'>Keanu_Reeves</span>
                            <span className='user-correct'>Пользователь</span>
                        </div>
                    </div>
                </div>
                <aside className="devBlogs">
                    <div className="user-wrapper">
                        <div className="devBlogs__header">Ваши возможности</div>
                        <button className="user__nav-btn"><Link to="/userblogs">МОИ СТАТЬИ</Link></button>
                        <button className="user__nav-btn"><Link to="/likes">МНЕ ПОНРАВИЛОСЬ</Link></button>
                        <button className="user__nav-btn"><Link to="/setings">НАСТРОЙКИ</Link></button>
                    </div>
                </aside>
            </section>
        </>
    )
}

export default UserPage;