import { useState } from 'react';
import { Link, useNavigate} from 'react-router-dom';

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
        if (!formData.agreement) {
            alert('Вы должны принять пользовательское соглашение');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            alert('Пароли не совпадают');
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
            if (response.ok) {
                setShowModal(true);
                alert('Код подтверждения отправлен на ваш email');
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('Ошибка сервера');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async () => {
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
            if (response.ok) {
                alert('Аккаунт успешно подтвержден');
                setShowModal(false);
                navigate('/login');
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('Ошибка при подтверждении');
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

                    <button type="submit" disabled={isLoading}> {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}</button>
                </form>
            </div>
            <div className="authChange__block">
                <span>Уже есть аккаунт</span>
                <Link to="/login">Войти</Link>
            </div>
            {showModal && (
                <div className="modal">
                    <div className='modal-content'>
                        <h3>Подтверждение Email</h3>
                        <input
                            type="text"
                            placeholder="Введите код подтверждения"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                        />
                        <button className='btnModalVer' onClick={handleVerify}>Подтвердить</button>
                    </div>
                </div>
            )}
        </>
    );
}

export default RegisterPage;