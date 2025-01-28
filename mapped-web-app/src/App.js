// src/App.js
import React, { useState } from 'react';
import MapComponent from './map/MapComponent';
import Toolbar from './toolbar/Toolbar';
import './App.css';

const App = () => {
    const [mapInstance, setMapInstance] = useState(null);

    const handleSearch = (lat, lng) => {
        if (mapInstance) {
            mapInstance.flyTo({ center: [lng, lat], zoom: 10 });
        }
    };

    return (
        <div className="App">
            <Toolbar onSearch={handleSearch} />
            <MapComponent onMapLoad={setMapInstance} />
        </div>
    );
};

export default App;