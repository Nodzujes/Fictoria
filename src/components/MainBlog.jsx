import { useState } from "react";
import PropTypes from "prop-types";

function MainBlog({ post }) {
  const [liked, setLiked] = useState(false);

  const likeClick = () => {
    setLiked(!liked);
  };

  // Обеспечиваем, что categories — это массив
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
        <div className="meta__blog-content-icons">
          <button id="like" onClick={likeClick}>
            <img
              src={liked ? "/icons/likeActive.png" : "/icons/likeNoActive.png"}
              alt="иконка лайка"
            />
          </button>
          <a href={`/post/${post.id}#comments`} id="comment">
            <img src="/icons/chat.png" alt="иконка комментариев" />
          </a>
        </div>
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
  }).isRequired
};

export default MainBlog;