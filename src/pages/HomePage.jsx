import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DevNews from '../components/DevNews.jsx';
import MainBlog from '../components/MainBlog.jsx';
import { useUser } from '../context/UserContext.jsx';

function HomePage() {
  const [posts, setPosts] = useState([]);
  const { category } = useParams(); // Получаем категорию из URL (например, /category/Фильмы)
  const { user, isLoading: userLoading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        let url = '/api/posts/all';
        if (category === 'Моя лента') {
          if (!user) {
            navigate('/login'); // Перенаправляем на логин, если не авторизован
            return;
          }
          url = `/api/posts/my-feed/${user.id}`; // Получаем ленту пользователя
        } else if (category) {
          url = `/api/posts/category/${encodeURIComponent(category)}`; // Посты по категории
        }

        const response = await fetch(url, { credentials: 'include' });
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Ошибка при загрузке постов:', error);
      }
    };

    if (!userLoading) {
      fetchPosts();
    }
  }, [category, user, userLoading, navigate]);

  if (userLoading) {
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