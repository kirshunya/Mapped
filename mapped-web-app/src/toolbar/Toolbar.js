// src/components/Toolbar.js
import React, { useState } from 'react';
import { FaSearch, FaUser } from 'react-icons/fa';

const Toolbar = ({ onSearch }) => {
    const [lat, setLat] = useState('');
    const [lng, setLng] = useState('');

    const handleSearch = () => {
        if (lat && lng) {
            onSearch(parseFloat(lat), parseFloat(lng));
        }
    };

    return (
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000, display: 'flex', gap: '10px' }}>
            <input
                type="text"
                placeholder="Широта"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
            />
            <input
                type="text"
                placeholder="Долгота"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
            />
            <button onClick={handleSearch}><FaSearch /></button>
            <button onClick={() => alert('Переход на профиль')}><FaUser /></button>
        </div>
    );
};

export default Toolbar;