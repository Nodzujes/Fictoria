import { useRef, useState } from "react";

function SetingsPage() {
    const fileInputRef = useRef(null);
    const [avatar, setAvatar] = useState("/images/userIcon.png"); //Исходная аватарка
    const maxFileSize = 1 * 1024 * 1024; // 1MB в байтах

    const changeFileClick = () => {
        fileInputRef.current.click();
    };

    const changeFile = () => {
        const file = event.target.files[0];
        if (file) {
            if (!["image/png", "image/jpeg", "image/gif"].includes(file.type)) {
                alert("Формат изображения должен быть JPG, PNG или GIF.");
                return;
            }

            if (file.size > maxFileSize) {
                alert("Размер файла больше допустимового");
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatar(e.target.result); // Устанавливаем новое изображение
            };
            reader.readAsDataURL(file);
        }
    }

    //Работа с категориями
    const [selectedCategory, setSelectedCategory] = useState([]);

    const toggleCategory = (category) => {
        setSelectedCategory((prev) => {
            const updatedCategories = Array.isArray(prev) ? prev : []; // Убедимся, что prev — это массив
            return updatedCategories.includes(category)
                ? updatedCategories.filter((c) => c !== category)
                : [...updatedCategories, category];
        });
    };

    const categories = ["Комиксы", "Фильмы", "Сериалы", "Аниме", "Манга", "Другое"];

    return (
        <>
            <div className="setings__header"><h1>Настройки</h1></div>
            <div className="setings__block">
                <div className="setings__grid-container">
                    <div className="userRealName-input">
                        <h2>Настоящие имя</h2>
                        <input type="text" maxLength={40} />
                        <span>Укажите ваши имя и фамилию. Максимум 40 символов</span>
                    </div>
                    <div className="userStatus-input">
                        <h2>Выбирете статус</h2>
                        <input type="text" maxLength={30} />
                        <span>Укажите ваши статус. Максимум 30 символов</span>
                    </div>
                    <div className="userChooseIcon-block">
                        <h2>Аватар</h2>
                        <img src={avatar} alt="user icon" />
                        <span>Формат: jpg, gif, png.</span>
                        <span>Максимальный размер файла: 1Mb.</span>
                        <span>Рекомендуется: до 300x300px.</span>
                        <button onClick={changeFileClick}>Загрузить</button>
                        <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/png, image/jpeg, image/gif" onChange={changeFile} />
                    </div>
                </div>
                <div className="setings__block__themes">
                    <div className="setings__block__themes-header">Что вас интерисует</div>
                    <div className="setings__block__themes-choose">
                        {categories.map((category) => (
                            <button key={category}
                                className={selectedCategory.includes(category) ? "selected" : ""}
                                onClick={() => toggleCategory(category)}
                            >{category}</button>
                        ))}
                    </div>
                    <button id="saveSetings">Сохранить изменения</button>
                </div>
            </div>
        </>
    );
}

export default SetingsPage;