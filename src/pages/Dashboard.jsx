import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from 'axios';

const Dashboard = () => {
    const [userData, setUserData] = useState([]);
    const [likeData, setLikeData] = useState([]);
    const [postData, setPostData] = useState([]);

    useEffect(() => {
        // Получение данных о пользователях
        axios.get('http://localhost:5277/api/admin/users-by-month', { withCredentials: true })
            .then(response => {
                setUserData(response.data);
            })
            .catch(error => console.error('Ошибка загрузки данных пользователей:', error));

        // Получение данных о лайках
        axios.get('http://localhost:5277/api/admin/likes-by-month', { withCredentials: true })
            .then(response => {
                setLikeData(response.data);
            })
            .catch(error => console.error('Ошибка загрузки данных лайков:', error));

        // Получение данных о постах
        axios.get('http://localhost:5277/api/admin/posts-by-month', { withCredentials: true })
            .then(response => {
                setPostData(response.data);
            })
            .catch(error => console.error('Ошибка загрузки данных постов:', error));
    }, []);

    return (
        <div className="dashboard">
            <h2 style={{ color: '#E3E3E3', fontFamily: 'Montserrat', fontSize: '24px', marginBottom: '20px' }}>
                Метрики за последний месяц
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                {/* График регистрации пользователей */}
                <div>
                    <h3 style={{ color: '#FF8C42', fontFamily: 'Inter', fontSize: '19px', marginBottom: '10px' }}>
                        Регистрация пользователей
                    </h3>
                    <LineChart width={800} height={300} data={userData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" stroke="#E3E3E3" />
                        <YAxis stroke="#E3E3E3" />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="count" stroke="#5AB9EA" activeDot={{ r: 8 }} />
                    </LineChart>
                </div>

                {/* График лайков */}
                <div>
                    <h3 style={{ color: '#FF8C42', fontFamily: 'Inter', fontSize: '19px', marginBottom: '10px' }}>
                        Лайки
                    </h3>
                    <LineChart width={800} height={300} data={likeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" stroke="#E3E3E3" />
                        <YAxis stroke="#E3E3E3" />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="count" stroke="#FF8C42" activeDot={{ r: 8 }} />
                    </LineChart>
                </div>

                {/* График постов */}
                <div>
                    <h3 style={{ color: '#FF8C42', fontFamily: 'Inter', fontSize: '19px', marginBottom: '10px' }}>
                        Созданные посты
                    </h3>
                    <LineChart width={800} height={300} data={postData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" stroke="#E3E3E3" />
                        <YAxis stroke="#E3E3E3" />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="count" stroke="#76b852" activeDot={{ r: 8 }} />
                    </LineChart>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;