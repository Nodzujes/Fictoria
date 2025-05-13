function DevNews(){
    return(
        <aside className="devBlogs">
        <div className="devBlogs-wrapper">
          <div className="devBlogs__header">Новости компании</div>
          <article id="devBlog 1">
            <div className="top">
              <img src="/images/logo-blogs.png" alt="" />
              <h3>Мы запустились!</h3>
            </div>
            <p>
              Наша гик-станция официально запущена! Пиши статьи, обсуждай любимые вселенные, 
              делись мемами и собирай лайки от своих. Это только начало — вперёд, на встречу 
              фандомам!
            </p>
          </article>
          <article id="devBlog 2">
            <div className="top">
              <img src="/images/logo-blogs.png" alt="" />
              <h3>Советы по созданию постов</h3>
            </div>
            <p>
              Заполняйте блоки акуратно и тщательно. Будьте грамотными в ваших постах. 
              Пока что посты нельзя редактировать, но мы работаем над этим.
            </p>
          </article>
          <article id="devBlog 3">
            <div className="top">
              <img src="/images/logo-blogs.png" alt="" />
              <h3>Первые герои уже в деле!</h3>
            </div>
            <p>
              Пользователи начали публиковать первые статьи — и это 🔥! 
              Присоединяйся: делись мыслями о своих любимых фандомах, комментируй, ставь лайки. Мир гиков ждёт твой голос!
            </p>
          </article>
        </div>
      </aside>
    )
}

export default DevNews;