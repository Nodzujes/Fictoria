import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import MainBlog from '../components/MainBlog.jsx';
import { useUser } from '../context/UserContext.jsx';

function UserBlogs() {
    const { user } = useUser();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('User in UserBlogs:', user);
        if (user?.id) {
            const fetchUserPosts = async () => {
                setLoading(true);
                try {
                    const response = await fetch(`http://localhost:5277/api/posts/user/${user.id}`, {
                        credentials: 'include',
                    });
                    console.log('Fetch posts response status:', response.status);
                    if (!response.ok) {
                        throw new Error(`Ошибка HTTP: ${response.status}`);
                    }
                    const data = await response.json();
                    console.log('Fetched posts:', data);
                    setPosts(data);
                } catch (error) {
                    console.error('Ошибка при загрузке постов:', error);
                    setError(error.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchUserPosts();
        } else {
            console.warn('User ID не найден:', user?.id);
            setError('Пользователь не авторизован или ID отсутствует');
        }
    }, [user]);

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
                    {loading && <p>Загрузка постов...</p>}
                    {error && <p>Ошибка: {error}</p>}
                    {!loading && !error && posts.length > 0 ? (
                        posts.map((post) => (
                            <MainBlog key={post.id} post={post} />
                        ))
                    ) : (
                        !loading && !error && <p>У вас пока нет созданных постов.</p>
                    )}
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
    );
}

export default UserBlogs;