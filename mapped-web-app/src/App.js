import React from 'react';
import MapComponent from './map/MapComponent';
import './App.css'; // Убедитесь, что вы импортируете стили

const App = () => {
    return (
        <div className="app-container">
            <header className="toolbar">
                <h1 className="title">Карта</h1>
                <div className="profile-buttons">
                    <button className="profile-button">Профиль</button>
                    <button className="profile-button">Настройки</button>
                </div>
            </header>
            <MapComponent />
        </div>
    );
};

export default App;