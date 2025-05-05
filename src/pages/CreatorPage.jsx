import { useState, useEffect, useRef } from 'react';
import DevNews from '../components/DevNews.jsx';

function Creator() {
    const [blocks, setBlocks] = useState([]); // Храним добавленные блоки в состоянии
    const [selectedBlock, setSelectedBlock] = useState(null); // Храним выбранный блок для добавления
    const [showModal, setShowModal] = useState(false); // Управляем видимостью модального окна
    const [coverImage, setCoverImage] = useState(null); // Храним URL обложки
    const [imageInputs, setImageInputs] = useState([]); // Храним состояния для input'ов блоков изображений
    const [videoInputs, setVideoInputs] = useState([]); // Храним состояния для input'ов блоков видео
    const [selectedCategories, setSelectedCategories] = useState([]); // Храним выбранные категории

    // Refs для каждого элемента загрузки
    const coverInputRef = useRef(null);

    useEffect(() => {
        const addBtnSelect = document.querySelector('.open-creator-modal');
        const modalSelect = document.querySelector('.modal__Creator');

        if (!addBtnSelect || !modalSelect) return;

        const openModal = () => {
            setShowModal(true);
        };

        const closeModal = (event) => {
            if (event.target === modalSelect) {
                setShowModal(false);
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

    const handleCategorySelect = (category) => {
        setSelectedCategories((prev) =>
            prev.includes(category)
                ? prev.filter((c) => c !== category) // Убираем категорию, если она уже выбрана
                : [...prev, category] // Добавляем категорию, если её нет
        );
    };

    const addBlock = () => {
        if (!selectedBlock) return;

        const newBlock = {
            type: selectedBlock,
            id: Date.now(),
        };

        setBlocks((prevBlocks) => [...prevBlocks, newBlock]);
        setSelectedBlock(null);
        setShowModal(false);

        // Инициализируем состояния для новых блоков изображений и видео
        if (selectedBlock === 'images') {
            setImageInputs((prev) => [...prev, Array(4).fill(null)]);
        } else if (selectedBlock === 'videos') {
            setVideoInputs((prev) => [...prev, null]);
        }
    };

    const handleImageUpload = (event, index, blockIndex) => {
        const file = event.target.files[0];
        if (file) {
            if (imageInputs[blockIndex]?.[index]) {
                URL.revokeObjectURL(imageInputs[blockIndex][index]);
            }
            const url = URL.createObjectURL(file);
            setImageInputs((prev) => {
                const newInputs = [...prev];
                newInputs[blockIndex] = newInputs[blockIndex].map((img, i) =>
                    i === index ? url : img
                );
                return newInputs;
            });
        }
    };

    const handleCoverImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (coverImage) {
                URL.revokeObjectURL(coverImage);
            }
            const url = URL.createObjectURL(file);
            setCoverImage(url);
        }
    };

    const handleVideoUpload = (event, blockIndex) => {
        const file = event.target.files[0];
        if (file) {
            if (videoInputs[blockIndex]) {
                URL.revokeObjectURL(videoInputs[blockIndex]);
            }
            const url = URL.createObjectURL(file);
            setVideoInputs((prev) => {
                const newInputs = [...prev];
                newInputs[blockIndex] = url;
                return newInputs;
            });
        }
    };

    const handleImageReplace = (event, index, blockIndex) => {
        event.preventDefault();
        console.log('Attempting to replace image at blockIndex:', blockIndex, 'index:', index);
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => handleImageUpload(e, index, blockIndex);
        input.click();
    };

    const handleCoverReplace = (event) => {
        event.preventDefault();
        console.log('Attempting to replace cover image');
        if (coverInputRef.current) {
            coverInputRef.current.click();
        } else {
            console.log('Cover input ref is null');
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = handleCoverImageUpload;
            input.click();
        }
    };

    const handleVideoReplace = (event, blockIndex) => {
        event.preventDefault();
        console.log('Attempting to replace video at blockIndex:', blockIndex);
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*,image/*';
        input.onchange = (e) => handleVideoUpload(e, blockIndex);
        input.click();
    };

    const renderBlock = (block, blockIndex) => {
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
                            <div key={index}>
                                {imageInputs[blockIndex]?.[index] ? (
                                    <img
                                        src={imageInputs[blockIndex][index]}
                                        alt="uploaded"
                                        style={{ width: '537px', height: '415px', objectFit: 'cover', cursor: 'pointer' }}
                                        onClick={(e) => handleImageReplace(e, index, blockIndex)}
                                    />
                                ) : (
                                    <button
                                        type="button"
                                        onClick={(e) => handleImageReplace(e, index, blockIndex)}
                                    >
                                        <span className='plussChar'>+</span>
                                        <span className='plussDescription'>Загрузить фото</span>
                                        <p>Рекомендуемое разрешение 537 х 302.<br />Формат — JPG, GIF, PNG.</p>
                                    </button>
                                )}
                            </div>
                        ))}
                    </form>
                );
            case 'videos':
                return (
                    <form key={block.id} id={`videos-block-blog-${block.id}`} className="videos-block-blog">
                        <div>
                            {videoInputs[blockIndex] ? (
                                // Определяем тип файла и рендерим <video> или <img>
                                (() => {
                                    const isVideo = videoInputs[blockIndex].match(/\.(mp4|mkv)$/i);
                                    if (isVideo) {
                                        return (
                                            <video
                                                controls
                                                style={{ width: '100%', height: '616px', objectFit: 'cover', cursor: 'pointer' }}
                                                onClick={(e) => handleVideoReplace(e, blockIndex)}
                                            >
                                                <source src={videoInputs[blockIndex]} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                        );
                                    } else {
                                        return (
                                            <img
                                                src={videoInputs[blockIndex]}
                                                alt="uploaded content"
                                                style={{ width: '100%', height: '616px', objectFit: 'cover', cursor: 'pointer' }}
                                                onClick={(e) => handleVideoReplace(e, blockIndex)}
                                            />
                                        );
                                    }
                                })()
                            ) : (
                                <button
                                    type="button"
                                    id={`pushVideoBlog-${block.id}`}
                                    onClick={(e) => handleVideoReplace(e, blockIndex)}
                                >
                                    <span className='plussChar'>+</span>
                                    <span className='plussDescription'>Загрузить контент</span>
                                    <p>Рекомендуемое разрешение 1094 х 616.<br />Формат — JPG, GIF, PNG, MP4, MKV.</p>
                                </button>
                            )}
                        </div>
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
                            <span>Блок видео</span>
                        </div>
                    </div>
                    <button type="button" id='addBlockPost' onClick={addBlock}>Добавить</button>
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
                                    <button
                                        id='films'
                                        type="button"
                                        className={`category ${selectedCategories.includes('films') ? 'active-category' : ''}`}
                                        onClick={() => handleCategorySelect('films')}
                                    >
                                        Фильмы
                                    </button>
                                    <button
                                        id='series'
                                        type="button"
                                        className={`category ${selectedCategories.includes('series') ? 'active-category' : ''}`}
                                        onClick={() => handleCategorySelect('series')}
                                    >
                                        Сериалы
                                    </button>
                                    <button
                                        id='anime'
                                        type="button"
                                        className={`category ${selectedCategories.includes('anime') ? 'active-category' : ''}`}
                                        onClick={() => handleCategorySelect('anime')}
                                    >
                                        Аниме
                                    </button>
                                    <button
                                        id='manga'
                                        type="button"
                                        className={`category ${selectedCategories.includes('manga') ? 'active-category' : ''}`}
                                        onClick={() => handleCategorySelect('manga')}
                                    >
                                        Манга
                                    </button>
                                    <button
                                        id='comics'
                                        type="button"
                                        className={`category ${selectedCategories.includes('comics') ? 'active-category' : ''}`}
                                        onClick={() => handleCategorySelect('comics')}
                                    >
                                        Комиксы
                                    </button>
                                    <button
                                        id='another'
                                        type="button"
                                        className={`category ${selectedCategories.includes('another') ? 'active-category' : ''}`}
                                        onClick={() => handleCategorySelect('another')}
                                    >
                                        Другое
                                    </button>
                                </div>
                            </div>
                                {coverImage ? (
                                    <img
                                        src={coverImage}
                                        alt="cover"
                                        style={{ width: '100%', height: '415px', objectFit: 'cover', cursor: 'pointer' }}
                                        onClick={(e) => handleCoverReplace(e)}
                                    />
                                ) : (
                                    <button
                                        type="button"
                                        id='pushImgBlog'
                                        onClick={(e) => handleCoverReplace(e)}
                                    >
                                        <span className='plussChar'>+</span>
                                        <span className='plussDescription'>Загрузить обложку</span>
                                        <p>
                                            Рекомендуемое разрешение 1094 х 415.<br />
                                            Формат — JPG, GIF, PNG.
                                        </p>
                                    </button>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={coverInputRef}
                                    onChange={handleCoverImageUpload}
                                    style={{ display: 'none' }}
                                />
                            <div className="creator__description">
                                <label htmlFor="">Введение статьи</label>
                                <textarea name="descriptionBlog" id="" maxLength={1400}></textarea>
                                <span>Напишите введение к вашей статье. Максимум 1400 символов</span>
                            </div>
                        </form>
                        {blocks.map((block, index) => renderBlock(block, index))}
                        <button type="button" className='open-creator-modal'>
                            <span className='plussChar'>+</span>
                            <span className='plussDescription'>Выберите следующие блоки для вашей статьи</span>
                        </button>
                        <button type="button" id='pushBlog'>Опубликовать</button>
                    </div>
                </div>
                <DevNews />
            </section>
        </>
    );
}

export default Creator;