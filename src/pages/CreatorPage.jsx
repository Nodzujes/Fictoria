import { useState, useEffect } from 'react';
import DevNews from '../components/DevNews.jsx';

function Creator() {
    const [blocks, setBlocks] = useState([]); // Храним добавленные блоки в состоянии
    const [selectedBlock, setSelectedBlock] = useState(null); // Храним выбранный блок для добавления
    const [showModal, setShowModal] = useState(false); // Управляем видимостью модального окна

    useEffect(() => {
        const addBtnSelect = document.querySelector('.open-creator-modal');
        const modalSelect = document.querySelector('.modal__Creator');

        if (!addBtnSelect || !modalSelect) return;

        const openModal = () => {
            setShowModal(true); // Устанавливаем состояние для открытия модального окна
        };

        const closeModal = (event) => {
            if (event.target === modalSelect) {
                setShowModal(false); // Устанавливаем состояние для закрытия модального окна
            }
        };

        addBtnSelect.addEventListener('click', openModal);
        window.addEventListener('click', closeModal);

        return () => {
            addBtnSelect.removeEventListener('click', openModal);
            window.removeEventListener('click', closeModal);
        };
    }, []);

    const handleBlockSelect = (blockType) => {
        setSelectedBlock(blockType);
    };

    const addBlock = () => {
        if (!selectedBlock) return;

        const newBlock = {
            type: selectedBlock,
            id: Date.now(), // Уникальный ID для каждого блока
        };

        setBlocks((prevBlocks) => [...prevBlocks, newBlock]);
        setSelectedBlock(null); // Сбрасываем выбор
        setShowModal(false); // Закрываем модальное окно
    };

    const renderBlock = (block) => {
        switch (block.type) {
            case 'text':
                return (
                    <form key={block.id} id={`text-block-blog-${block.id}`} className="text-block-blog">
                        <label htmlFor="">Заголовок текста</label>
                        <input type="text" maxLength={100} />
                        <span>Напишите заголовок вашего текста. Максимум 100 символов</span>
                        <label htmlFor="">Текст блога</label>
                        <textarea name="" id="" maxLength={1800}></textarea>
                        <span>Напишите введение к вашей статье. Максимум 1800 символов</span>
                    </form>
                );
            case 'images':
                return (
                    <form key={block.id} id={`images-block-blog-${block.id}`} className="images-block-blog">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <button key={index}>
                                <span className='plussChar'>+</span>
                                <span className='plussDescription'>Загрузить фото</span>
                                <p>Рекомендуемое разрешение 537 х 302.<br />Формат — JPG, GIF, PNG.</p>
                            </button>
                        ))}
                    </form>
                );
            case 'videos':
                return (
                    <form key={block.id} id={`videos-block-blog-${block.id}`} className="videos-block-blog">
                        <button id={`pushVideoBlog-${block.id}`}>
                            <span className='plussChar'>+</span>
                            <span className='plussDescription'>Загрузить контент</span>
                            <p>Рекомендуемое разрешение 1094 х 616.<br />Формат — JPG, GIF, PNG, MP4, MKV.</p>
                        </button>
                    </form>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <div className="modal__Creator" style={{ display: showModal ? 'flex' : 'none' }}>
                <div className='modal__Creator-content'>
                    <div className="modal__Creator-select">
                        <div
                            id="text__block-select"
                            onClick={() => handleBlockSelect('text')}
                            className={selectedBlock === 'text' ? 'selected' : ''}
                        >
                            <img src="/public/images/block-text.png" alt="image of text" />
                            <span>Блок текста</span>
                        </div>
                        <div
                            id="images__block-select"
                            onClick={() => handleBlockSelect('images')}
                            className={selectedBlock === 'images' ? 'selected' : ''}
                        >
                            <img src="/public/images/block-images.png" alt="image of images" />
                            <span>Блок изображений</span>
                        </div>
                        <div
                            id="videos__block-select"
                            onClick={() => handleBlockSelect('videos')}
                            className={selectedBlock === 'videos' ? 'selected' : ''}
                        >
                            <img src="/public/images/block-video.png" alt="image of video" />
                            <span>Блок видео / фото</span>
                        </div>
                    </div>
                    <button id='addBlockPost' onClick={addBlock}>Добавить</button>
                </div>
            </div>
            <section className="content">
                <div className="content-blog">
                    <div className="content-creator">
                        <form id='start-blog'>
                            <div className="creator__start-name">
                                <label htmlFor="">Название статьи</label>
                                <input type="text" maxLength={255} />
                                <span>Укажите название вашей статьи. Максимум 255 символов</span>
                            </div>
                            <div className="creator__categories">
                                <label htmlFor="">Выберите категории к статье </label>
                                <div className="creator__categories-set">
                                    <button id='films' className='category'>Фильмы</button>
                                    <button id='series' className='category'>Сериалы</button>
                                    <button id='anime' className='category'>Аниме</button>
                                    <button id='manga' className='category'>Манга</button>
                                    <button id='comics' className='category'>Комиксы</button>
                                    <button id='another' className='category'>Другое</button>
                                </div>
                            </div>
                            <button id='pushImgBlog'>
                                <span className='plussChar'>+</span>
                                <span className='plussDescription'>Загрузить обложку</span>
                                <p>
                                    Рекомендуемое разрешение 1094 х 415.<br />
                                    Формат — JPG, GIF, PNG.
                                </p>
                            </button>
                            <div className="creator__description">
                                <label htmlFor="">Введение статьи</label>
                                <textarea name="descriptionBlog" id="" maxLength={1400}></textarea>
                                <span>Напишите введение к вашей статье. Максимум 1400 символов</span>
                            </div>
                        </form>
                        {blocks.map(block => renderBlock(block))}
                        <button className='open-creator-modal'>
                            <span className='plussChar'>+</span>
                            <span className='plussDescription'>Выберите следующие блоки для вашей статьи</span>
                        </button>
                        <button id='pushBlog'>Опубликовать</button>
                    </div>
                </div>
                <DevNews />
            </section>
        </>
    );
}

export default Creator;