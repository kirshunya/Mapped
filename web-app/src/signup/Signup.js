// Signup.js

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = ({ setIsAuthenticated }) => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [age, setAge] = useState('');
    const [photo, setPhoto] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8085/signup', {
                email,
                name,
                password,
                age: parseInt(age),
                photo
            });
            console.log(response)
            if (response.status === 200) {
                setIsAuthenticated(true);
                const userData = {
                    email,
                    name,
                    age: parseInt(age),
                    photo
                };
                localStorage.setItem('user', JSON.stringify(userData));

                navigate("/");
            } else {
                alert('Ошибка регистрации');
                console.log(response)
            }
        } catch (error) {
            console.error('Signup error:', error);
            alert('Ошибка регистрации');
        }
    };

    return (
        <div className="auth-container">
            <h1>Регистрация</h1>
            <form onSubmit={handleSignup}>
                <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="text" placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} required />
                <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <input type="number" placeholder="Возраст" value={age} onChange={(e) => setAge(e.target.value)} required />
                <input type="text" placeholder="URL фотографии" value={photo} onChange={(e) => setPhoto(e.target.value)} />
                <button type="submit">Зарегистрироваться</button>
            </form>
            <p>Уже есть аккаунт? <a href="/login">Войти</a></p>
        </div>
    );
};

export default Signup;