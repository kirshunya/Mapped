import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const MapComponent = () => {
    const mapContainer = useRef(null);

    useEffect(() => {
        const map = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL', // Здесь можно указать нужный стиль
            center: [37.618423, 55.751244], // Долгота, Широта для Москвы
            zoom: 1,
        });

        // Очистка карты при размонтировании компонента
        return () => map.remove();
    }, []);

    return (
        <div ref={mapContainer} className="map-container" />
    );
};

export default MapComponent;