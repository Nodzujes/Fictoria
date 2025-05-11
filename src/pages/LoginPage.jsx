import { Link } from 'react-router-dom';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useUser } from '../context/UserContext.jsx';
import ReCAPTCHA from 'react-google-recaptcha';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const { fetchUserProfile } = useUser();
    const recaptchaRef = useRef(null);

    const onReCaptchaSuccess = useCallback((token) => {
        console.log('reCAPTCHA token received:', token);
        setRecaptchaToken(token);
    }, []);

    const onReCaptchaExpired = useCallback(() => {
        console.log('reCAPTCHA token expired');
        setRecaptchaToken(null);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return;

        setIsLoading(true);
        setError('');

        if (!recaptchaToken) {
            setError('Пожалуйста, подтвердите, что вы не робот');
            setIsLoading(false);
            return;
        }

        try {
            console.log('Submitting login for:', email);
            const response = await fetch('http://localhost:5277/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email, password, recaptchaToken }),
            });

            const data = await response.json();
            console.log('Login response:', data);
            console.log('is_admin:', data.is_admin, 'type:', typeof data.is_admin);

            if (!response.ok) {
                if (data.message === 'Подтвердите email перед входом') {
                    setShowModal(true);
                    return;
                }
                throw new Error(data.message || 'Ошибка авторизации');
            }

            await fetchUserProfile();

            // Перенаправление на основе is_admin
            if (data.is_admin === 1 || data.is_admin === true) {
                console.log('Redirecting to admin panel');
                window.location.href = 'http://localhost:5277/admin'; // Изменено на полный URL
            } else {
                console.log('Redirecting to home page');
                window.location.href = 'http://localhost:5277'; // Изменено на полный URL
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message);
            if (recaptchaRef.current) {
                recaptchaRef.current.reset();
            }
            setRecaptchaToken(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            console.log('Verifying code for:', email);
            const response = await fetch('http://localhost:5277/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    code: verificationCode
                })
            });

            const data = await response.json();
            console.log('Verify response:', data);
            if (response.ok) {
                alert('Аккаунт успешно подтвержден');
                setShowModal(false);
                await handleSubmit({ preventDefault: () => {} });
            } else {
                setError(data.message);
            }
        } catch (error) {
            console.error('Verification error:', error);
            setError('Ошибка при подтверждении');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            console.log('Resending verification code for:', email);
            const response = await fetch('http://localhost:5277/api/auth/resend-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            console.log('Resend code response:', data);
            if (response.ok) {
                alert('Новый код подтверждения отправлен на ваш email');
            } else {
                setError(data.message);
            }
        } catch (error) {
            console.error('Resend code error:', error);
            setError('Ошибка при отправке кода');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        console.log('Resetting reCAPTCHA on mount');
        if (recaptchaRef.current) {
            recaptchaRef.current.reset();
        }
        setRecaptchaToken(null);
    }, []);

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
                        disabled={isLoading}
                    />

                    <label>Пароль</label>
                    <input
                        type="password"
                        id="loginPass"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                    />

                    <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey="6LeMTdsqAAAAAIjCEA7JL71tJ9vLOAQJftVBq1od"
                        onChange={onReCaptchaSuccess}
                        onExpired={onReCaptchaExpired}
                    />

                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Загрузка...' : 'Авторизация'}
                    </button>
                </form>
            </div>
            <div className="authChange__block">
                <span>Ещё нет аккаунта?</span>
                <Link to="/reg">Зарегистрируйтесь</Link>
            </div>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Подтверждение Email</h3>
                        <p>Ваш email не подтвержден. Введите код, отправленный на ваш email.</p>
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
                        <button className="btnModalVerNew" onClick={handleResendCode} disabled={isLoading}>
                            Отправить новый код
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default Login;