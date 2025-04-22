import { Link } from 'react-router-dom';
import MainBlog from '../components/MainBlog.jsx';
import { useUser } from '../context/UserContext.jsx';

function UserBlogs() {
    const { user } = useUser();

    return (
        <>
            <section className="content">
                <div className="content-blog">
                    <div className="content__header"><Link to="/user"><h1>Профиль</h1></Link></div>
                    <div className="user__account-block">
                        <img
                            id='userIconModal'
                            src={user?.avatarUrl || "/images/userIcon.png"}
                            alt="user icon"
                        />
                        <div className="user__account-block-txt">
                            <span id='userNickname'>{user?.nickname || "Гость"}</span>
                            <span className='user-correct'>Пользователь</span>
                        </div>
                    </div>
                    <MainBlog />
                </div>
                <aside className="devBlogs">
                    <div className="user-wrapper">
                        <div className="devBlogs__header">Ваши возможности</div>
                        <button className="user__nav-btn onPage">МОИ СТАТЬИ</button>
                        <button className="user__nav-btn"><Link to="/likes">МНЕ ПОНРАВИЛОСЬ</Link></button>
                        <button className="user__nav-btn"><Link to="/setings">НАСТРОЙКИ</Link></button>
                    </div>
                </aside>
            </section>
        </>
    )
}

export default UserBlogs;