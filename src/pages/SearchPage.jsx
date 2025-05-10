function SearchPage() {
    return (
        <>
            <section className="content__search">
                <div className="content__search-input">
                    <form>
                        <input type="text" className="search-input" placeholder="Поиск" />
                        <button><img src="/icons/search.png" alt="иконка поиска" /></button>
                    </form>
                </div>
                <div className="content__search-resalt">
                    {/* Должны выводиться посты как и на главной странице */}
                    <p className="searchPosts">Введите название поста для поиска</p>
                </div>
            </section>
        </>
    )
};

export default SearchPage;