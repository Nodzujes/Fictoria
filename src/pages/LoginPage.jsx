import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useUser } from '../context/UserContext.jsx';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { fetchUserProfile } = useUser();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

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
                if (data.message === 'Подтвердите email перед входом') {
                    setShowModal(true);
                    return;
                }
                throw new Error(data.message || 'Ошибка авторизации');
            }

            await fetchUserProfile();
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleVerify = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5277/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    code: verificationCode
                })
            });

            const data = await response.json();
            if (response.ok) {
                alert('Аккаунт успешно подтвержден');
                setShowModal(false);
                await handleSubmit({ preventDefault: () => {} });
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError('Ошибка при подтверждении');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        try {
            const response = await fetch('http://localhost:5277/api/auth/resend-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            if (response.ok) {
                alert('Новый код подтверждения отправлен на ваш email');
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError('Ошибка при отправке кода');
            console.error(error);
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

            {showModal && (
                <div className="modal">
                    <div className='modal-content'>
                        <h3>Подтверждение Email</h3>
                        <p>Ваш email не подтвержден. Введите код, отправленный на ваш email.</p>
                        <input
                            type="text"
                            placeholder="Введите код подтверждения"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                        />
                        <button className='btnModalVer' onClick={handleVerify} disabled={isLoading}>
                            {isLoading ? 'Подтверждение...' : 'Подтвердить'}
                        </button>
                        <button className='btnModalVerNew'
                            onClick={handleResendCode}
                        >
                            Отправить новый код
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default Login;