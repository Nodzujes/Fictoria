import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DevNews from '../components/DevNews.jsx';
import MainBlog from '../components/MainBlog.jsx';
import { useUser } from '../context/UserContext.jsx';

function HomePage() {
  const [posts, setPosts] = useState([]);
  const { category } = useParams(); // Получаем категорию из URL (например, /category/Фильмы)
  const { user, loading: userLoading } = useUser(); // Используем 'loading' вместо 'isLoading'
  const navigate = useNavigate();

  useEffect(() => {
    console.log('HomePage useEffect: category=', category, 'user=', user, 'userLoading=', userLoading);
    const fetchPosts = async () => {
      try {
        let url = '/api/posts/all';
        if (category === 'Моя лента') {
          if (!user && !userLoading) {
            console.log('Redirecting to login: user is null and loading is complete');
            navigate('/login', { replace: true }); // Перенаправляем только после загрузки
            return;
          }
          if (user) {
            url = `/api/posts/my-feed/${user.id}`; // Получаем ленту пользователя
            console.log('Fetching my-feed for user:', user.id);
          } else {
            console.log('Waiting for user to load...');
            return; // Ждем загрузки пользователя
          }
        } else if (category) {
          url = `/api/posts/category/${encodeURIComponent(category)}`; // Посты по категории
          console.log('Fetching posts for category:', category);
        }

        const response = await fetch(url, { credentials: 'include' });
        console.log('Fetch posts response:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched posts:', data);
        setPosts(data);
      } catch (error) {
        console.error('Ошибка при загрузке постов:', error);
      }
    };

    // Выполняем загрузку, если пользователь загружен или не требуется проверка авторизации
    if (!userLoading || category !== 'Моя лента') {
      fetchPosts();
    }
  }, [category, user, userLoading, navigate]);

  // Показываем индикатор загрузки, пока данные пользователя загружаются
  if (userLoading && category === 'Моя лента') {
    console.log('Showing loading indicator for Моя лента');
    return <div>Загрузка...</div>;
  }

  return (
    <section className="content">
      <div className="content-blog">
        {posts.length === 0 ? (
          <p>Нет постов в этой категории.</p>
        ) : (
          posts.map((post) => (
            <MainBlog key={post.id} post={post} />
          ))
        )}
      </div>
      <DevNews />
    </section>
  );
}

export default HomePage;