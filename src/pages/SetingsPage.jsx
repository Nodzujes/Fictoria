import { useRef, useState, useEffect } from "react";
import { useUser } from '../context/UserContext.jsx';

function SetingsPage() {
    const fileInputRef = useRef(null);
    const [avatar, setAvatar] = useState("/images/userIcon.png");
    const [previewAvatar, setPreviewAvatar] = useState(null);
    const [name, setName] = useState("");
    const [status, setStatus] = useState("");
    const [selectedCategory, setSelectedCategory] = useState([]);
    const [error, setError] = useState(null);
    const maxFileSize = 1 * 1024 * 1024; // 1MB в байтах
    const { user, fetchUserProfile, isLoading } = useUser();

    // Загрузка данных пользователя при монтировании
    useEffect(() => {
        const loadProfile = async () => {
            try {
                console.log('Fetching user profile...');
                await fetchUserProfile();
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError('Ошибка загрузки профиля');
            }
        };
        loadProfile();
    }, []); // Пустой массив зависимостей для вызова только при монтировании

    // Синхронизация данных с user
    useEffect(() => {
        if (user) {
            console.log('User data loaded:', user);
            setAvatar(user.avatarUrl || "/images/userIcon.png");
            setName(user.name || "");
            setStatus(user.status || "");
            setSelectedCategory(user.categories || []);
        }
    }, [user]);

    const changeFileClick = () => {
        fileInputRef.current.click();
    };

    const changeFile = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (!["image/png", "image/jpeg", "image/gif"].includes(file.type)) {
                alert("Формат изображения должен быть JPG, PNG или GIF.");
                return;
            }

            if (file.size > maxFileSize) {
                alert("Размер файла больше допустимого");
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewAvatar(e.target.result); // Устанавливаем предварительный просмотр
            };
            reader.readAsDataURL(file);
        }
    };

    const cancelAvatar = () => {
        setPreviewAvatar(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Очищаем input
        }
    };

    // Работа с категориями
    const toggleCategory = (category) => {
        setSelectedCategory((prev) => {
            const updatedCategories = Array.isArray(prev) ? prev : [];
            return updatedCategories.includes(category)
                ? updatedCategories.filter((c) => c !== category)
                : [...updatedCategories, category];
        });
    };

    const saveSettings = async () => {
        setError(null);
        const formData = new FormData();

        // Добавляем только измененные поля
        if (name !== (user?.name || '')) {
            formData.append("name", name);
        }
        if (status !== (user?.status || '')) {
            formData.append("status", status);
        }
        if (JSON.stringify(selectedCategory.sort()) !== JSON.stringify((user?.categories || []).sort())) {
            formData.append("categories", JSON.stringify(selectedCategory));
        }
        if (fileInputRef.current.files[0]) {
            formData.append("avatar", fileInputRef.current.files[0]);
        }

        // Если нет изменений, уведомляем пользователя
        if (![...formData.entries()].length) {
            alert("Нет изменений для сохранения");
            return;
        }

        try {
            console.log('Saving settings:', [...formData.entries()]);
            const response = await fetch("http://localhost:5277/api/auth/update-profile", {
                method: "POST",
                credentials: "include",
                body: formData,
            });
            const data = await response.json();
            console.log('Save settings response:', data);
            if (response.ok) {
                alert("Настройки сохранены!");
                if (data.avatarUrl) {
                    setAvatar(data.avatarUrl);
                    setPreviewAvatar(null); // Очищаем предварительный просмотр
                    if (fileInputRef.current) {
                        fileInputRef.current.value = ""; // Очищаем input
                    }
                }
                // Обновляем данные пользователя
                await fetchUserProfile();
            } else {
                throw new Error(data.message || "Ошибка при сохранении настроек");
            }
        } catch (error) {
            console.error("Ошибка при сохранении настроек:", error);
            setError("Ошибка сервера");
        }
    };

    const categories = ["Комиксы", "Фильмы", "Сериалы", "Аниме", "Манга", "Другое"];

    if (isLoading) {
        return <div>Загрузка...</div>;
    }

    return (
        <>
            <div className="setings__header"><h1>Настройки</h1></div>
            <div className="setings__block">
                <div className="setings__grid-container">
                    <div className="userRealName-input">
                        <h2>Настоящее имя</h2>
                        <input
                            type="text"
                            maxLength={40}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <span>Укажите ваши имя и фамилию. Максимум 40 символов</span>
                    </div>
                    <div className="userStatus-input">
                        <h2>Выберите статус</h2>
                        <input
                            type="text"
                            maxLength={30}
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        />
                        <span>Укажите ваш статус. Максимум 30 символов</span>
                    </div>
                    <div className="userChooseIcon-block">
                        <h2>Аватар</h2>
                        <img src={previewAvatar || avatar} alt="user icon" />
                        <span>Формат: jpg, gif, png.</span>
                        <span>Максимальный размер файла: 1Mb.</span>
                        <span>Рекомендуется: до 300x300px.</span>
                        <button onClick={changeFileClick}>Загрузить</button>
                        {previewAvatar && (
                            <button onClick={cancelAvatar}>Отменить</button>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            accept="image/png, image/jpeg, image/gif"
                            onChange={changeFile}
                        />
                    </div>
                </div>
                <div className="setings__block__themes">
                    <div className="setings__block__themes-header">Что вас интересует</div>
                    <div className="setings__block__themes-choose">
                        {categories.map((category) => (
                            <button
                                key={category}
                                className={selectedCategory.includes(category) ? "selected" : ""}
                                onClick={() => toggleCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                    <button id="saveSetings" onClick={saveSettings}>Сохранить изменения</button>
                </div>
                {error && <div className="error">{error}</div>}
            </div>
        </>
    );
}

export default SetingsPage;