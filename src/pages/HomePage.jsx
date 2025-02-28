import DevNews from '../components/DevNews.jsx';
import MainBlog from '../components/MainBlog.jsx';

function HomePage() {
  return (
    <>
      <section className="content">
        <div className="content-blog">
          <MainBlog />
          <MainBlog />
          <MainBlog />
          <MainBlog />
          <MainBlog />
          <MainBlog />
          <MainBlog />
          <MainBlog />
        </div>
        <DevNews />
      </section>
    </>
  );
}

export default HomePage;