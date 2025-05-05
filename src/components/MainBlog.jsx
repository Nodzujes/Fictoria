import { useState } from "react";

function MainBlog() {
  const [liked, setliked] = useState(false);

  const likeClick = () => {
    setliked(!liked);
  };

  return (
    <article className="content-blog-item">
      <div className="meta__user">
        <img id="userIcon" src="/images/userIcon.png" alt="иконка пользователя" />
        <span id="userName">Keanu_Reeves</span>
      </div>
      <div className="meta__blog-content">
        <div className="meta__blog-name">
          <h2 id="nameBlog">Название статьи</h2>
          <div className="meta__blog-name-category">
            <div id="id_category">Фильмы</div>
            <div id="id_category">Сериалы</div>
          </div>
        </div>
        <img id="coverBlog" src="/images/coverBlog.png" alt="обложка статьи" />
        <p id="descriptionBlog">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry.
          Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s,
          when an unknown printer took a galley of type and scrambled it to make a type specimen book.
          It has survived not only five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset
          sheets containing Lorem Ipsum passages, and more recently with desktop publishing software
          like Aldus PageMaker including versions of Lorem Ipsum.
        </p>
        <p id="textBlog">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry.
          Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s,
          when an unknown printer took a galley of type and scrambled it to make a type specimen book.
        </p>
        <div className="meta__read-all">
          <a id="allBlog" href="#">Читать дальше</a>
        </div>
        <div className="meta__blog-content-icons">
          <button id="like" onClick={likeClick}>
            <img src={liked ? "/icons/likeActive.png" : "/icons/likeNoActive.png"} alt="иконка лайка" />
          </button>
          <a href="" id="comment"><img src="/icons/chat.png" alt="иконка комментариев" /></a>
        </div>
      </div>
    </article>
  );
};

export default MainBlog;