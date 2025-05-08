// import { useState } from "react";
import DevNews from '../components/DevNews.jsx';

function BlogPage() {
    // const [liked, setLiked] = useState(false);

    // const likeClick = () => {
    //     setLiked(!liked);
    // };
    return (
        <>
            <section className="content">
                <div className="content-blog">
                    {/* <article className="content-blog-item">
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
                            <img id="coverBlog" src="/images/coverBlog.png" alt="оьложка статьи" />
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
                    </article> */}
                    <div className="chat__comment">
                        <div className="wrapper">
                            <h2>Комментарии</h2>
                            <div className="chat__comment-comment">
                                <div className="comment-header">
                                    <img id="userIconComment" src="/public/images/userIcon.png" alt="Иконка пользователя" />
                                    <span className="user-nickName">Like_Films</span>
                                </div>
                                <p className="cooment-user">
                                    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
                                    doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore
                                    veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim
                                    ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
                                    consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque
                                    porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur,
                                    adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et
                                    dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis
                                    nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid
                                    ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea
                                    voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem
                                    eum fugiat quo voluptas nulla pariatur?
                                </p>
                            </div>
                            <div className="chat__comment-comment">
                                <div className="comment-header">
                                    <img id="userIconComment" src="/public/images/userIcon.png" alt="Иконка пользователя" />
                                    <span className="user-nickName">Like_Films</span>
                                </div>
                                <p className="cooment-user">
                                    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
                                    doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore
                                    veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim
                                    ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
                                    consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque
                                    porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur,
                                    adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et
                                    dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis
                                    nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid
                                    ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea
                                    voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem
                                    eum fugiat quo voluptas nulla pariatur?
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="comment-block">
                        <div className="wrapper">
                            <h2>Ваш комментарий</h2>
                            <form id="yourComment">
                                <textarea name="comment" id="writeComment"></textarea>
                                <button id="sendComment">Отправить</button>
                            </form>
                        </div>
                    </div>
                </div>
                <DevNews />
            </section>
        </>
    )
}

export default BlogPage;