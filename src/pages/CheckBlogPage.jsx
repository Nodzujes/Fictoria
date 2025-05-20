import { useState, useEffect } from 'react';
import MainBlog from '../components/MainBlog.jsx'; // Импортируем MainBlog

function CheckPage() {
    const [pendingPosts, setPendingPosts] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPendingPosts = async () => {
            try {
                const response = await fetch('http://localhost:5277/api/posts/pending', {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await response.json();
                if (response.ok) {
                    setPendingPosts(data);
                } else {
                    setError(data.message || 'Ошибка при загрузке постов');
                }
            } catch (err) {
                console.error('Ошибка при загрузке постов:', err);
                setError('Произошла ошибка при загрузке постов');
            }
        };

        fetchPendingPosts();
    }, []);

    const handleApprove = async (postId) => {
        try {
            const response = await fetch(`http://localhost:5277/api/posts/approve/${postId}`, {
                method: 'POST',
                credentials: 'include',
            });
            const data = await response.json();
            if (response.ok) {
                setPendingPosts(pendingPosts.filter(post => post.id !== postId));
                alert('Пост одобрен!');
            } else {
                alert(`Ошибка: ${data.message}`);
            }
        } catch (err) {
            console.error('Ошибка при одобрении поста:', err);
            alert('Произошла ошибка при одобрении поста');
        }
    };

    return (
        <section className="admin-page">
            <h1>Панель модерации постов</h1>
            {error && <p className="error">{error}</p>}
            {pendingPosts.length === 0 ? (
                <p className='noPostsCheck'>Нет постов, ожидающих модерации</p>
            ) : (
                <div className="content-blog">
                    {pendingPosts.map(post => (
                        <MainBlog
                            key={post.id}
                            post={post}
                            isAdmin={true}
                            onApprove={() => handleApprove(post.id)}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

export default CheckPage;