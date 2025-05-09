import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import MainBlog from '../components/MainBlog.jsx';
import { useUser } from '../context/UserContext.jsx';

function UserLikePage() {
    const { user, loading } = useUser(); // Добавляем loading
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('User in UserLikePage:', user);
        if (user?.id) {
            const fetchLikedPosts = async () => {
                try {
                    const response = await fetch(`http://localhost:5277/api/posts/liked/${user.id}`, {
                        credentials: 'include',
                    });
                    console.log('Fetch liked posts response status:', response.status);
                    if (!response.ok) {
                        throw new Error(`Ошибка HTTP: ${response.status}`);
                    }
                    const data = await response.json();
                    console.log('Fetched liked posts:', data);
                    setPosts(data);
                } catch (error) {
                    console.error('Ошибка при загрузке лайкнутых постов:', error);
                    setError(error.message);
                }
            };
            fetchLikedPosts();
        } else if (!loading) { // Проверяем только если загрузка завершена
            console.warn('User ID не найден:', user?.id);
            setError('Пользователь не авторизован или ID отсутствует');
        }
    }, [user, loading]);

    if (loading) {
        return <div className="no__posts"><p>Загрузка...</p></div>; // Показываем загрузку, пока идет проверка
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

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
                    {error && <p>Ошибка: {error}</p>}
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <MainBlog key={post.id} post={post} />
                        ))
                    ) : (
                        !error && <div className="no__posts"><p>Вы пока не лайкнули ни одного поста.</p></div>
                    )}
                </div>
                <aside className="devBlogs">
                    <div className="user-wrapper">
                        <div className="devBlogs__header">Ваши возможности</div>
                        <button className="user__nav-btn"><Link to="/userblogs">МОИ СТАТЬИ</Link></button>
                        <button className="user__nav-btn onPage">МНЕ ПОНРАВИЛОСЬ</button>
                        <button className="user__nav-btn"><Link to="/setings">НАСТРОЙКИ</Link></button>
                    </div>
                </aside>
            </section>
        </>
    );
}

export default UserLikePage;