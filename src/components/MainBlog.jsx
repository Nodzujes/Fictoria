import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useUser } from '../context/UserContext.jsx';

function MainBlog({ post, isAdmin, onApprove }) {
  const { user, loading: userLoading } = useUser();
  const [liked, setLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(true);

  useEffect(() => {
    if (isAdmin || userLoading || !user?.id || !post?.id) {
      setLikeLoading(false);
      return;
    }

    const checkLike = async () => {
      try {
        setLikeLoading(true);
        const response = await fetch(`/api/posts/like/${post.id}`, {
          credentials: 'include',
        });
        console.log('Check like response status:', response.status);
        if (!response.ok) {
          throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        const data = await response.json();
        console.log('Check like data for post', post.id, ':', data);
        if (response.ok) {
          setLiked(data.liked);
        }
      } catch (error) {
        console.error('Ошибка при проверке лайка для поста', post.id, ':', error);
      } finally {
        setLikeLoading(false);
      }
    };
    checkLike();
  }, [user, userLoading, post, isAdmin]);

  const likeClick = async () => {
    if (!user) {
      alert('Пожалуйста, войдите, чтобы поставить лайк');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts/like/${post.id}`, {
        method: 'POST',
        credentials: 'include',
      });
      console.log('Toggle like response status:', response.status);
      const data = await response.json();
      console.log('Toggle like data:', data);
      if (response.ok) {
        setLiked(data.liked);
      } else {
        throw new Error(data.message || 'Ошибка при обработке лайка');
      }
    } catch (error) {
      console.error('Ошибка при обработке лайка:', error);
      alert('Ошибка при обработке лайка');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = Array.isArray(post.categories)
    ? post.categories
    : typeof post.categories === 'string'
      ? JSON.parse(post.categories)
      : [];

  return (
    <article className="content-blog-item">
      <div className="meta__user">
        <img
          id="userIcon"
          src={post.avatar_url || "/images/userIcon.png"}
          alt="иконка пользователя"
        />
        <span id="userName">{post.nickname || "Неизвестный пользователь"}</span>
      </div>
      <div className="meta__blog-content">
        <div className="meta__blog-name">
          <h2 id="nameBlog">{post.title || "Название статьи"}</h2>
          <div className="meta__blog-name-category">
            {categories.map((category, index) => (
              <div key={index} id="id_category">{category}</div>
            ))}
          </div>
        </div>
        <img
          id="coverBlog"
          src={post.cover_url || "/images/coverBlog.png"}
          alt="обложка статьи"
        />
        <p id="descriptionBlog">
          {post.introduction ||
            "Lorem Ipsum — это просто текст-заглушка для печати и набора текста..."}
        </p>
        <div className="meta__read-all">
          <a id="allBlog" href={`/post/${post.id}`}>Читать дальше</a>
        </div>
        {isAdmin ? (
          <div className="meta__blog-content-actions">
            <button
              className="approve-btn"
              onClick={onApprove}
              disabled={isLoading}
            >
              Одобрить
            </button>
          </div>
        ) : (
          <div className="meta__blog-content-icons">
            <button id="like" onClick={likeClick} disabled={isLoading || likeLoading}>
              {likeLoading ? (
                <span>Загрузка...</span>
              ) : (
                <img
                  src={liked ? "/icons/likeActive.png" : "/icons/likeNoActive.png"}
                  alt="иконка лайка"
                />
              )}
            </button>
            <a href={`/post/${post.id}#comments`} id="comment">
              <img src="/icons/chat.png" alt="иконка комментариев" />
            </a>
          </div>
        )}
      </div>
    </article>
  );
}

MainBlog.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    introduction: PropTypes.string.isRequired,
    cover_url: PropTypes.string.isRequired,
    nickname: PropTypes.string.isRequired,
    avatar_url: PropTypes.string.isRequired,
    categories: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.string
    ]).isRequired
  }).isRequired,
  isAdmin: PropTypes.bool,
  onApprove: PropTypes.func
};

MainBlog.defaultProps = {
  isAdmin: false,
  onApprove: () => { }
};

export default MainBlog;