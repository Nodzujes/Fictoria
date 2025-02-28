import { Link } from 'react-router-dom';

function Login() {

    return (
        <>
            <div className="auth__conyainer">
                <form id="login" >
                    <h2>Авторизация</h2>

                    <label>Email</label>
                    <input type="email" id="loginEmail" name="email" required />

                    <label>Пароль</label>
                    <input type="password" id="loginPass" name="password" required />

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