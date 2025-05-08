import { useState, useEffect, useRef } from 'react';
import DevNews from '../components/DevNews.jsx';

function Creator() {
    const [blocks, setBlocks] = useState([]);
    const [selectedBlock, setSelectedBlock] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [coverImage, setCoverImage] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [imageInputs, setImageInputs] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [videoInputs, setVideoInputs] = useState([]);
    const [videoFiles, setVideoFiles] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [title, setTitle] = useState('');
    const [introduction, setIntroduction] = useState('');
    const [textBlocks, setTextBlocks] = useState([]);

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
                ? prev.filter((c) => c !== category)
                : [...prev, category]
        );
    };

    const addBlock = () => {
        if (!selectedBlock) return;

        const newBlock = {
            type: selectedBlock,
            id: Date.now(),
        };

        setBlocks((prevBlocks) => {
            const updatedBlocks = [...prevBlocks, newBlock];
            if (selectedBlock === 'images') {
                setImageInputs((prev) => [...prev, Array(4).fill(null)]);
                setImageFiles((prev) => [...prev, Array(4).fill(null)]);
            } else if (selectedBlock === 'videos') {
                setVideoInputs((prev) => [...prev, null]);
                setVideoFiles((prev) => [...prev, null]);
            } else if (selectedBlock === 'text') {
                setTextBlocks((prev) => [...prev, { title: '', content: '' }]);
            }
            return updatedBlocks;
        });

        setSelectedBlock(null);
        setShowModal(false);
    };

    const handleImageUpload = (event, index, blockIndex) => {
        const file = event.target.files[0];
        if (file) {
            setImageInputs((prev) => {
                const newInputs = [...prev];
                if (!newInputs[blockIndex]) {
                    newInputs[blockIndex] = Array(4).fill(null);
                }
                if (newInputs[blockIndex][index]) {
                    URL.revokeObjectURL(newInputs[blockIndex][index]);
                }
                const url = URL.createObjectURL(file);
                newInputs[blockIndex][index] = url;
                return newInputs;
            });

            setImageFiles((prev) => {
                const newFiles = [...prev];
                if (!newFiles[blockIndex]) {
                    newFiles[blockIndex] = Array(4).fill(null);
                }
                newFiles[blockIndex][index] = file;
                return newFiles;
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
            setCoverFile(file);
        }
    };

    const handleVideoUpload = (event, blockIndex) => {
        const file = event.target.files[0];
        if (file) {
            setVideoInputs((prev) => {
                const newInputs = [...prev];
                if (newInputs[blockIndex]) {
                    URL.revokeObjectURL(newInputs[blockIndex]);
                }
                newInputs[blockIndex] = URL.createObjectURL(file);
                return newInputs;
            });

            setVideoFiles((prev) => {
                const newFiles = [...prev];
                newFiles[blockIndex] = file;
                return newFiles;
            });
        }
    };

    const handleTextChange = (blockIndex, field, value) => {
        setTextBlocks((prev) => {
            const newTextBlocks = [...prev];
            newTextBlocks[blockIndex] = {
                ...newTextBlocks[blockIndex],
                [field]: value,
            };
            return newTextBlocks;
        });
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

    const handlePublish = async () => {
        try {
            const authResponse = await fetch('http://localhost:5277/api/auth/check', {
                method: 'GET',
                credentials: 'include',
            });
            const authData = await authResponse.json();

            if (!authData.isAuthenticated) {
                alert('Вы должны сначала зарегистрироваться, чтобы создать пост!');
                return;
            }

            if (!title || !introduction || !coverFile) {
                alert('Заполните все обязательные поля: заголовок, введение и обложку!');
                return;
            }

            if (selectedCategories.length === 0) {
                alert('Выберите хотя бы одну категорию!');
                return;
            }

            const formData = new FormData();
            formData.append('title', title);
            formData.append('introduction', introduction);
            formData.append('categories', JSON.stringify(selectedCategories));
            formData.append('cover', coverFile);

            const postBlocks = blocks.map((block, index) => {
                if (block.type === 'text') {
                    return {
                        type: 'text',
                        order: index + 1,
                        title: textBlocks[index]?.title || '',
                        content: textBlocks[index]?.content || '',
                    };
                } else if (block.type === 'images') {
                    return {
                        type: 'images',
                        order: index + 1,
                        mediaFiles: imageFiles[index] || [],
                    };
                } else if (block.type === 'videos') {
                    return {
                        type: 'videos',
                        order: index + 1,
                        mediaFile: videoFiles[index] || null,
                    };
                }
                return null;
            }).filter(block => block !== null);

            formData.append('blocks', JSON.stringify(postBlocks));

            postBlocks.forEach((block, blockIndex) => {
                if (block.type === 'images') {
                    block.mediaFiles.forEach((file, fileIndex) => {
                        if (file) {
                            formData.append(`images_${blockIndex}_${fileIndex}`, file);
                        }
                    });
                } else if (block.type === 'videos' && block.mediaFile) {
                    formData.append(`video_${blockIndex}`, block.mediaFile);
                }
            });

            console.log('Отправляемые категории:', selectedCategories); // Логирование для отладки

            const response = await fetch('http://localhost:5277/api/posts/create', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            const result = await response.json();
            if (response.ok) {
                alert('Пост успешно опубликован!');
                setTitle('');
                setIntroduction('');
                setSelectedCategories([]);
                setCoverImage(null);
                setCoverFile(null);
                setBlocks([]);
                setImageInputs([]);
                setImageFiles([]);
                setVideoInputs([]);
                setVideoFiles([]);
                setTextBlocks([]);
            } else {
                alert(`Ошибка при публикации: ${result.message}`);
            }
        } catch (error) {
            console.error('Ошибка при публикации:', error);
            alert('Произошла ошибка при публикации поста');
        }
    };

    const renderBlock = (block, blockIndex) => {
        switch (block.type) {
            case 'text':
                return (
                    <form key={block.id} id={`text-block-blog-${block.id}`} className="text-block-blog">
                        <label htmlFor="">Заголовок текста</label>
                        <input
                            type="text"
                            maxLength={100}
                            value={textBlocks[blockIndex]?.title || ''}
                            onChange={(e) => handleTextChange(blockIndex, 'title', e.target.value)}
                        />
                        <span>Напишите заголовок вашего текста. Максимум 100 символов</span>
                        <label htmlFor="">Текст блога</label>
                        <textarea
                            maxLength={1800}
                            value={textBlocks[blockIndex]?.content || ''}
                            onChange={(e) => handleTextChange(blockIndex, 'content', e.target.value)}
                        ></textarea>
                        <span>Напишите введение к вашей статье. Максимум 1800 символов</span>
                    </form>
                );
            case 'images':
                return (
                    <form key={block.id} id={`images-block-blog-${block.id}`} className="images-block-blog">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index}>
                                {imageInputs[blockIndex] && imageInputs[blockIndex][index] ? (
                                    <img
                                        src={imageInputs[blockIndex][index]}
                                        alt="uploaded"
                                        style={{ width: '537px', height: '302px', objectFit: 'cover', cursor: 'pointer' }}
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
                    <form key={block.id} id={`videos-block-blog-${block.id}`} className=" internals-block-blog">
                        <div>
                            {videoInputs[blockIndex] ? (
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
                            <img src="/images/block-text.png" alt="image of text" />
                            <span>Блок текста</span>
                        </div>
                        <div
                            id="images__block-select"
                            onClick={() => handleBlockSelect('images')}
                            className={selectedBlock === 'images' ? 'selected' : ''}
                        >
                            <img src="/images/block-images.png" alt="image of images" />
                            <span>Блок изображений</span>
                        </div>
                        <div
                            id="videos__block-select"
                            onClick={() => handleBlockSelect('videos')}
                            className={selectedBlock === 'videos' ? 'selected' : ''}
                        >
                            <img src="/images/block-video.png" alt="image of video" />
                            <span>Блок видео / фото</span>
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
                                <input
                                    type="text"
                                    maxLength={255}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                                <span>Укажите название вашей статьи. Максимум 255 символов</span>
                            </div>
                            <div className="creator__categories">
                                <label htmlFor="">Выберите категории к статье </label>
                                <div className="creator__categories-set">
                                    <button
                                        id='Фильмы'
                                        type="button"
                                        className={`category ${selectedCategories.includes('Фильмы') ? 'active-category' : ''}`}
                                        onClick={() => handleCategorySelect('Фильмы')}
                                    >
                                        Фильмы
                                    </button>
                                    <button
                                        id='Сериалы'
                                        type="button"
                                        className={`category ${selectedCategories.includes('Сериалы') ? 'active-category' : ''}`}
                                        onClick={() => handleCategorySelect('Сериалы')}
                                    >
                                        Сериалы
                                    </button>
                                    <button
                                        id='Аниме'
                                        type="button"
                                        className={`category ${selectedCategories.includes('Аниме') ? 'active-category' : ''}`}
                                        onClick={() => handleCategorySelect('Аниме')}
                                    >
                                        Аниме
                                    </button>
                                    <button
                                        id='Манга'
                                        type="button"
                                        className={`category ${selectedCategories.includes('Манга') ? 'active-category' : ''}`}
                                        onClick={() => handleCategorySelect('Манга')}
                                    >
                                        Манга
                                    </button>
                                    <button
                                        id='Комиксы'
                                        type="button"
                                        className={`category ${selectedCategories.includes('Комиксы') ? 'active-category' : ''}`}
                                        onClick={() => handleCategorySelect('Комиксы')}
                                    >
                                        Комиксы
                                    </button>
                                    <button
                                        id='Другое'
                                        type="button"
                                        className={`category ${selectedCategories.includes('Другое') ? 'active-category' : ''}`}
                                        onClick={() => handleCategorySelect('Другое')}
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
                                <button type="button" id='pushImgBlog' onClick={(e) => handleCoverReplace(e)}>
                                    <span className='plussChar'>+</span>
                                    <span className='plussDescription'>Загрузить обложку</span>
                                    <p>
                                        Рекомендуемое разрешение 1094 х 415.<br />
                                        Формат — JPG, GIF, PNG.
                                    </p>
                                </button>
                            )}
                            <input type="file" accept="image/*" ref={coverInputRef} onChange={handleCoverImageUpload} style={{ display: 'none' }}/>
                            <div className="creator__description">
                                <label htmlFor="">Введение статьи</label>
                                <textarea name="descriptionBlog" maxLength={1400} value={introduction} onChange={(e) => setIntroduction(e.target.value)}></textarea>
                                <span>Напишите введение к вашей статье. Максимум 1400 символов</span>
                            </div>
                        </form>
                        {blocks.map((block, index) => renderBlock(block, index))}
                        <button type="button" className='open-creator-modal'>
                            <span className='plussChar'>+</span>
                            <span className='plussDescription'>Выберите следующие блоки для вашей статьи</span>
                        </button>
                        <button type="button" id='pushBlog' onClick={handlePublish}>Опубликовать</button>
                    </div>
                </div>
                <DevNews />
            </section>
        </>
    );
}

export default Creator;