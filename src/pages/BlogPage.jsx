import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DevNews from '../components/DevNews.jsx';

function BlogPage() {
    const { id } = useParams(); // Извлекаем ID поста из URL
    const [post, setPost] = useState(null);
    const [blocks, setBlocks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Запрашиваем пост и его блоки при монтировании компонента
    useEffect(() => {
        const fetchPost = async () => {
            try {
                // Запрашиваем данные поста
                const postResponse = await fetch(`/api/posts/${id}`);
                if (!postResponse.ok) {
                    throw new Error(`Ошибка при загрузке поста: ${postResponse.statusText}`);
                }
                const postData = await postResponse.json();
                if (postData.message) {
                    throw new Error(postData.message);
                }

                // Запрашиваем блоки поста
                const blocksResponse = await fetch(`/api/posts/blocks/${id}`);
                if (!blocksResponse.ok) {
                    throw new Error(`Ошибка при загрузке блоков: ${blocksResponse.statusText}`);
                }
                const blocksData = await blocksResponse.json();

                setPost(postData);
                setBlocks(blocksData);
                setIsLoading(false);
            } catch (error) {
                console.error('Ошибка при загрузке поста:', error);
                setError(error.message);
                setIsLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    if (isLoading) {
        return <div>Загрузка...</div>;
    }

    if (error) {
        return <div>Ошибка: {error}</div>;
    }

    if (!post) {
        return <div>Пост не найден</div>;
    }

    // Парсим категории из данных поста
    const categories = Array.isArray(post.categories)
        ? post.categories
        : typeof post.categories === 'string'
            ? JSON.parse(post.categories)
            : [];

    // Отображаем медиа-блоки (изображения или видео)
    const renderMediaBlock = (block) => {
        let mediaUrls = block.media_urls;
        // Если media_urls — строка, преобразуем её в массив
        if (typeof mediaUrls === 'string') {
            mediaUrls = mediaUrls.startsWith('[') ? JSON.parse(mediaUrls) : [mediaUrls];
        } else if (!Array.isArray(mediaUrls)) {
            mediaUrls = [];
        }
        return (
            <div className="meta__media-block">
                {mediaUrls.map((url, index) => (
                    block.type === 'images' ? (
                        <img key={index} src={url} alt={`media-${index}`} className="media-image" />
                    ) : (
                        <video key={index} src={url} controls className="media-video" />
                    )
                ))}
            </div>
        );
    };

    return (
        <>
            <section className="content">
                <div className="content-blog">
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
                            {/* Отображаем все блоки */}
                            {blocks.sort((a, b) => a.order - b.order).map((block, index) => (
                                <div key={index} className="meta__block">
                                    {block.type === 'text' && (
                                        <>
                                            {block.title && <h3>{block.title}</h3>}
                                            <p>{block.content}</p>
                                        </>
                                    )}
                                    {(block.type === 'images' || block.type === 'videos') && renderMediaBlock(block)}
                                </div>
                            ))}
                        </div>
                    </article>
                    <div className="chat__comment">
                        <div className="wrapper">
                            <h2>Комментарии</h2>
                            <div className="chat__comment-comment">
                                <div className="comment-header">
                                    <img id="userIconComment" src="/images/userIcon.png" alt="Иконка пользователя" />
                                    <span className="user-nickName">Like_Films</span>
                                </div>
                                <p className="comment-user">
                                    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
                                    doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore
                                    veritatis et quasi architecto beatae vitae dicta sunt explicabo...
                                </p>
                            </div>
                            <div className="chat__comment-comment">
                                <div className="comment-header">
                                    <img id="userIconComment" src="/images/userIcon.png" alt="Иконка пользователя" />
                                    <span className="user-nickName">Like_Films</span>
                                </div>
                                <p className="comment-user">
                                    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
                                    doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore
                                    veritatis et quasi architecto beatae vitae dicta sunt explicabo...
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
    );
}

export default BlogPage;