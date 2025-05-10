import { useState, useEffect } from 'react';
import MainBlog from '../components/MainBlog.jsx';

function SearchPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPosts = async (query) => {
        if (!query.trim()) {
            setPosts([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/posts/search?query=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error(`Ошибка при загрузке постов: ${response.status}`);
            }
            const data = await response.json();
            console.log('Полученные посты:', data); // Для отладки
            setPosts(data);
        } catch (err) {
            setError(err.message);
            setPosts([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchPosts(searchQuery);
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.trim()) {
                fetchPosts(searchQuery);
            } else {
                setPosts([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    return (
        <section className="content__search">
            <div className="content__search-input">
                <form onSubmit={handleSearch}>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Поиск"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit">
                        <img src="/icons/search.png" alt="иконка поиска" />
                    </button>
                </form>
            </div>
            <div className="content__search-result">
                {isLoading && <p className="searchPosts">Загрузка...</p>}
                {error && <p className="searchPosts error">{error}</p>}
                {!isLoading && !error && posts.length === 0 && searchQuery.trim() === '' && (
                    <p className="searchPosts">Введите название поста для поиска</p>
                )}
                {!isLoading && !error && posts.length === 0 && searchQuery.trim() !== '' && (
                    <p className="searchPosts">Посты не найдены</p>
                )}
                {!isLoading && !error && posts.length > 0 && (
                    <div className="content-blog">
                        {posts.map((post) => (
                            <MainBlog key={post.id} post={post} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

export default SearchPage;