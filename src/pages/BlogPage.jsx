import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DevNews from '../components/DevNews.jsx';
import { useUser } from '../context/UserContext.jsx';

function BlogPage() {
    const { id } = useParams(); // Извлекаем ID поста из URL
    const [post, setPost] = useState(null);
    const [blocks, setBlocks] = useState([]);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, loading: userLoading } = useUser();
    const navigate = useNavigate();

    // Запрашиваем пост, его блоки и комментарии при монтировании компонента
    useEffect(() => {
        const fetchPostData = async () => {
            try {
                // Запрашиваем данные поста
                const postResponse = await fetch(`/api/posts/${id}`, { credentials: 'include' });
                if (!postResponse.ok) {
                    throw new Error(`Ошибка при загрузке поста: ${postResponse.statusText}`);
                }
                const postData = await postResponse.json();
                if (postData.message) {
                    throw new Error(postData.message);
                }

                // Запрашиваем блоки поста
                const blocksResponse = await fetch(`/api/posts/blocks/${id}`, { credentials: 'include' });
                if (!blocksResponse.ok) {
                    throw new Error(`Ошибка при загрузке блоков: ${blocksResponse.statusText}`);
                }
                const blocksData = await blocksResponse.json();

                // Запрашиваем комментарии поста
                const commentsResponse = await fetch(`/api/comments/${id}`, { credentials: 'include' });
                if (!commentsResponse.ok) {
                    throw new Error(`Ошибка при загрузке комментариев: ${commentsResponse.statusText}`);
                }
                const commentsData = await commentsResponse.json();

                setPost(postData);
                setBlocks(blocksData);
                setComments(commentsData);
                setIsLoading(false);
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
                setError(error.message);
                setIsLoading(false);
            }
        };
        fetchPostData();
    }, [id]);

    // Обработка отправки комментария
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!user && !userLoading) {
            navigate('/login');
            return;
        }
        if (!newComment.trim()) {
            alert('Комментарий не может быть пустым');
            return;
        }

        try {
            const response = await fetch(`/api/comments/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comment: newComment }),
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error(`Ошибка при отправке комментария: ${response.statusText}`);
            }
            const addedComment = await response.json();
            setComments([addedComment, ...comments]); // Добавляем новый комментарий в начало
            setNewComment(''); // Очищаем поле ввода
            setError(null);
        } catch (error) {
            console.error('Ошибка при отправке комментария:', error);
            setError(error.message);
        }
    };

    // Обработка клика по textarea для неавторизованных пользователей
    const handleTextareaClick = () => {
        if (!user && !userLoading) {
            alert('Пожалуйста, авторизуйтесь, чтобы оставить комментарий.');
        }
    };

    // Форматирование даты комментария
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (isLoading || userLoading) {
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
                            {comments.length === 0 ? (
                                <p className="noComments">Комментариев пока нет. Будьте первым!</p>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} className="chat__comment-comment">
                                        <div className="comment-header">
                                            <img
                                                id="userIconComment"
                                                src={comment.avatar_url || "/images/userIcon.png"}
                                                alt="Иконка пользователя"
                                            />
                                            <span className="user-nickName">{comment.nickname}</span>
                                            <span className="comment-date">{formatDate(comment.created_at)}</span>
                                        </div>
                                        <p className="comment-user">{comment.coment}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <div className="comment-block">
                        <div className="wrapper">
                            <h2>Ваш комментарий</h2>
                            <form id="yourComment" onSubmit={handleCommentSubmit}>
                                <textarea
                                    name="comment"
                                    id="writeComment"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onClick={handleTextareaClick}
                                    placeholder="Напишите ваш комментарий..."
                                ></textarea>
                                {error && <p className="error-message">{error}</p>}
                                <button id="sendComment" type="submit" disabled={userLoading || !user}>
                                    Отправить
                                </button>
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