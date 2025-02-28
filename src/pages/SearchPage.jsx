import MainBlog from '../components/MainBlog.jsx';

function SearchPage() {
    return (
        <>
            <section className="content__search">
                <div className="content__search-input">
                    <form>
                        <input type="text" className="search-input" placeholder="Поиск" />
                        <button><img src="/public/icons/search.png" alt="иконка поиска" /></button>
                    </form>
                </div>
                <div className="content__search-resalt">
                    <MainBlog />
                </div>
            </section>
        </>
    )
};

export default SearchPage;