import { Link } from 'react-router-dom';
import '../styles/main.css';

const MetricHeader = () => {
    return (
        <header className="MetricHeader">
            <h1>Fictoria | Метрика</h1>
            <Link to="/admin" style={{ color: '#5AB9EA', textDecoration: 'none', marginLeft: '20px' }}>
                Админ панель
            </Link>
            <Link to="/" style={{ color: '#5AB9EA', textDecoration: 'none', marginLeft: '20px' }}>
                Главная страница
            </Link>
        </header>
    );
};

export default MetricHeader;