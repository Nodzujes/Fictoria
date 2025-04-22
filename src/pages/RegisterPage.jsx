import { useState } from 'react';
import { Link } from 'react-router-dom';

function RegisterPage() {
    const [formData, setFormData] = useState({
        email: '',
        nickname: '',
        password: '',
        confirmPassword: '',
        agreement: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.agreement) {
            alert('Вы должны принять пользовательское соглашение');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            alert('Пароли не совпадают');
            return;
        }

        try {
            const response = await fetch('http://localhost:5277/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    nickname: formData.nickname,
                    password: formData.password
                })
            });

            const data = await response.json();
            alert(data.message); // Выводим ответ сервера через alert
        } catch (error) {
            alert('Ошибка сервера');
            console.error(error);
        }
    };

    return (
        <>
            <div className="auth__conyainer">
                <form id="regForm" onSubmit={handleSubmit}>
                    <h2>Регистрация</h2>

                    <label>Email</label>
                    <input type="email" id="regEmail" name="email" value={formData.email} onChange={handleChange} required />

                    <label>Никнейм</label>
                    <input type="text" id="nickname" name="nickname" value={formData.nickname} onChange={handleChange} required />

                    <label>Пароль</label>
                    <input type="password" id="regPass" name="password" value={formData.password} onChange={handleChange} required />

                    <label>Пароль ещё раз</label>
                    <input type="password" id="confirmRegPass" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />

                    <div className="regConfCompany">
                        <input type="checkbox" id="Agreement" name="agreement" checked={formData.agreement} onChange={handleChange} />
                        <span>Я принимаю условия <a href="#">пользовательского соглашения</a></span>
                    </div>

                    <button type="submit">Зарегистрироваться</button>
                </form>
            </div>
            <div className="authChange__block">
                <span>Уже есть аккаунт</span>
                <Link to="/login">Войти</Link>
            </div>
        </>
    );
}

export default RegisterPage;