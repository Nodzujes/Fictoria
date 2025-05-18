import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function RegisterPage() {
    const [formData, setFormData] = useState({
        email: '',
        nickname: '',
        password: '',
        confirmPassword: '',
        agreement: false
    });
    
    const [showModal, setShowModal] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.agreement) {
            setError('Вы должны принять пользовательское соглашение');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        setIsLoading(true);
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
            console.log('Register response:', data);

            if (response.ok) {
                setShowModal(true);
            } else {
                if (data.message === 'Этот никнейм уже занят') {
                    alert('Этот никнейм уже занят. Пожалуйста, выберите другой.');
                } else {
                    setError(data.message || 'Ошибка регистрации');
                }
            }
        } catch (error) {
            console.error('Register error:', error);
            setError('Ошибка сервера');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async () => {
        setError('');
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5277/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    code: verificationCode
                })
            });

            const data = await response.json();
            console.log('Verify response:', data);
            if (response.ok) {
                alert('Аккаунт успешно подтвержден');
                setShowModal(false);
                navigate('/login');
            } else {
                setError(data.message || 'Ошибка подтверждения');
            }
        } catch (error) {
            console.error('Verification error:', error);
            setError('Ошибка при подтверждении');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="auth__conyainer">
                <form id="regForm" onSubmit={handleSubmit}>
                    <h2>Регистрация</h2>

                    {error && <div className="error">{error}</div>}

                    <label>Email</label>
                    <input type="email" id="regEmail" name="email" value={formData.email} onChange={handleChange} required disabled={isLoading} />

                    <label>Никнейм</label>
                    <input type="text" id="nickname" name="nickname" value={formData.nickname} onChange={handleChange} required disabled={isLoading} />

                    <label>Пароль</label>
                    <input type="password" id="regPass" name="password" value={formData.password} onChange={handleChange} required disabled={isLoading} />

                    <label>Пароль ещё раз</label>
                    <input type="password" id="confirmRegPass" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required disabled={isLoading} />

                    <div className="regConfCompany">
                        <input type="checkbox" id="Agreement" name="agreement" checked={formData.agreement} onChange={handleChange} disabled={isLoading} />
                        <span>Я принимаю условия <a href="#">пользовательского соглашения</a></span>
                    </div>

                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                </form>
            </div>
            <div className="authChange__block">
                <span>Уже есть аккаунт?</span>
                <Link to="/login">Войти</Link>
            </div>
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Подтверждение Email</h3>
                        {error && <div className="error">{error}</div>}
                        <input
                            type="text"
                            placeholder="Введите код подтверждения"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            disabled={isLoading}
                        />
                        <button className="btnModalVer" onClick={handleVerify} disabled={isLoading}>
                            {isLoading ? 'Подтверждение...' : 'Подтвердить'}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default RegisterPage;