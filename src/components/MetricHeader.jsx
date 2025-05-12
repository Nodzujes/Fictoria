import { Link } from 'react-router-dom';
import '../styles/main.css';

const MetricHeader = () => {
    return (
        <header className="MetricHeader">
            <h1>Fictoria | Метрика</h1>
            <Link to="/admin" style={{ color: '#5AB9EA', textDecoration: 'none', marginLeft: '20px' }}>
                Вернуться в админ-панель
            </Link>
        </header>
    );
};

export default MetricHeader;