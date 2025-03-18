import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setIsAuthenticated }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    // Проверяем, есть ли данные пользователя в локальном хранилище при загрузке компонента
    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            setIsAuthenticated(true);
            navigate("/");
        }
    }, [navigate, setIsAuthenticated]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8085/login', { email, password });
            if (response.data.status === "Success") {
                // Предполагаем, что сервер возвращает данные пользователя в response.data.user
                const userData = response.config.data;
                console.log('Login response:', userData);

                // Устанавливаем флаг аутентификации
                setIsAuthenticated(true);

                // Сохраняем данные пользователя в локальное хранилище
                localStorage.setItem('user', JSON.stringify(userData));

                // Переходим на главную страницу
                navigate("/");
            } else {
                throw new Error('Invalid login response');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Ошибка авторизации');
        }
    };

    return (
        <div className="auth-container">
            <h1>Вход</h1>
            <form onSubmit={handleLogin}>
                <input
                    type="text"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Войти</button>
            </form>
            <p>Нет аккаунта? <a href="/signup">Зарегистрироваться</a></p>
        </div>
    );
};

export default Login;