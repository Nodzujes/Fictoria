import { useState, useEffect } from 'react';
import DevNews from '../components/DevNews.jsx';
import MainBlog from '../components/MainBlog.jsx';

function HomePage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts/all');
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Ошибка при загрузке постов:', error);
      }
    };
    fetchPosts();
  }, []);

  return (
    <>
      <section className="content">
        <div className="content-blog">
          {posts.map((post) => (
            <MainBlog key={post.id} post={post} />
          ))}
        </div>
        <DevNews />
      </section>
    </>
  );
}

export default HomePage;