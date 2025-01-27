import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './MapComponent.css';

const MapComponent = () => {
    const mapContainer = useRef(null);
    const [markers, setMarkers] = useState([]);
    const [searchOpen, setSearchOpen] = useState(false);
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const mapRef = useRef(null);

    useEffect(() => {
        const map = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL',
            center: [37.618423, 55.751244],
            zoom: 10,
        });

        mapRef.current = map;

        const handleMapClick = (event) => {
            event.preventDefault();

            const { lng, lat } = event.lngLat;

            if (markers.some(marker => marker.lng === lng && marker.lat === lat)) {
                return;
            }

            const newMarker = { lng, lat };
            setMarkers((prevMarkers) => [...prevMarkers, newMarker]);

            const marker = new maplibregl.Marker()
                .setLngLat([lng, lat])
                .addTo(map);

            const popup = new maplibregl.Popup({ offset: 25 })
                .setText(`Загрузка информации...`)
                .setLngLat([lng, lat])
                .addTo(map);

            marker.getElement().addEventListener('click', (event) => {
                event.preventDefault(); // Отключаем стандартное поведение
                event.stopPropagation(); // Останавливаем всплытие события
                handleMarkerClick(lng, lat, popup);
            });
        };

        map.on('click', handleMapClick);

        return () => {
            map.off('click', handleMapClick);
            map.remove();
        };
    }, [markers]);

    const handleMarkerClick = async (lng, lat, popup) => {
        try {
            const response = await fetch(`http://localhost:8082/places/coordinates?latitude=${lat}&longitude=${lng}`);
            const data = await response.json();

            if (response.ok) {
                popup.setText(`${data.place.name}: ${data.place.description}`);
            } else {
                popup.setText(data.error);
            }
            popup.addTo(mapRef.current);
        } catch (error) {
            console.error('Ошибка при получении данных:', error);
            popup.setText('Ошибка при получении данных');
            popup.addTo(mapRef.current);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchOpen(false);

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (!isNaN(lat) && !isNaN(lng)) {
            mapRef.current.setCenter([lng, lat]);
            mapRef.current.setZoom(15);

            const marker = new maplibregl.Marker()
                .setLngLat([lng, lat])
                .addTo(mapRef.current);

            const popup = new maplibregl.Popup({ offset: 25 })
                .setText(`Координаты: ${lat}, ${lng}`)
                .setLngLat([lng, lat])
                .addTo(mapRef.current);
        } else {
            alert('Пожалуйста, введите корректные координаты.');
        }
    };

    return (
        <div>
            <button onClick={() => setSearchOpen(!searchOpen)}>Поиск места</button>
            {searchOpen && (
                <div className="search-overlay">
                    <form onSubmit={handleSearch} className="search-form">
                        <div className="input-group">
                            <label>Широта:</label>
                            <input
                                type="number"
                                step="any"
                                placeholder="Введите широту"
                                value={latitude}
                                onChange={(e) => setLatitude(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Долгота:</label>
                            <input
                                type="number"
                                step="any"
                                placeholder="Введите долготу"
                                value={longitude}
                                onChange={(e) => setLongitude(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit">Найти</button>
                        <button type="button" onClick={() => setSearchOpen(false)}>Закрыть</button>
                    </form>
                </div>
            )}
            <div ref={mapContainer} className="map-container" style={{ width: '100%', height: '100vh' }} />
        </div>
    );
};

export default MapComponent;
