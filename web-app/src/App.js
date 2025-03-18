// App.js

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import MapPage from './map/MapComponent';
import Login from './login/Login';
import Signup from './signup/Signup';
import Profile from './profile/Profile';
import './App.css';

const App = () => {
    const [places, setPlaces] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
        }
    }, []);

    useEffect(() => {
        const fetchPlaces = async () => {
            if (isAuthenticated) {
                try {
                    const response = await axios.get('http://localhost:8085/places');
                    setPlaces(response.data.places);
                } catch (error) {
                    console.error('Error fetching places:', error);
                }
            }
        };

        fetchPlaces();
    }, [isAuthenticated]);

    return (
        <Router>
            <div className="map-container">
                {isAuthenticated && user && (
                    <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
                        {/*<Profile user={user} />*/}
                    </div>
                )}
                <Routes>
                    <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                    <Route path="/signup" element={<Signup setIsAuthenticated={setIsAuthenticated} />} />
                    <Route path="/" element={isAuthenticated ? <MapPage places={places} /> : <Navigate to="/login" />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;