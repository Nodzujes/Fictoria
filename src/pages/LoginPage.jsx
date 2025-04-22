import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useUser } from '../context/UserContext.jsx';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { fetchUserProfile } = useUser(); // Импортируем fetchUserProfile

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5277/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Ошибка авторизации');
            }

            // Успешная авторизация — загружаем данные пользователя и перенаправляем
            await fetchUserProfile(); // Загружаем данные пользователя
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <>
            <div className="auth__conyainer">
                <form id="login" onSubmit={handleSubmit}>
                    <h2>Авторизация</h2>

                    {error && <div className="error">{error}</div>}

                    <label>Email</label>
                    <input
                        type="email"
                        id="loginEmail"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label>Пароль</label>
                    <input
                        type="password"
                        id="loginPass"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit">Авторизация</button>
                </form>
            </div>
            <div className="authChange__block">
                <span>Ещё нет аккаунта?</span>
                <Link to="/reg">Зарегистрируйтесь</Link>
            </div>
        </>
    );
}

export default Login;