// src/components/MapComponent.js
import React, { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Функция для вычисления расстояния между двумя координатами (в метрах)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Радиус Земли в метрах
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Расстояние в метрах
};

const MapComponent = () => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markers = useRef([]); // Используем useRef для хранения маркеров

    useEffect(() => {
        if (map.current) return; // Инициализация карты только один раз

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL', // Замените на ваш ключ
            center: [0, 0],
            zoom: 2
        });

        // Обработчик клика на карту
        map.current.on('click', (e) => {
            // Проверяем, был ли клик на маркере
            const features = map.current.queryRenderedFeatures(e.point, {
                layers: ['markers'] // Убедитесь, что маркеры добавлены в слой 'markers'
            });

            // Если клик был на маркере, не создаем новый маркер
            if (features.length > 0) {
                return;
            }

            const { lng, lat } = e.lngLat;

            // Проверяем, есть ли маркер в радиусе 10 метров
            const isMarkerNearby = markers.current.some((marker) => {
                const distance = calculateDistance(lat, lng, marker.lat, marker.lng);
                return distance <= 10; // 10 метров
            });

            if (isMarkerNearby) {
                alert('Маркер уже существует в радиусе 10 метров!');
                return;
            }

            // Создаем новый маркер
            const newMarker = {
                lng,
                lat,
                info: `Маркер на координатах: ${lng}, ${lat}`,
                photos: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCalT-bv9Nap_tJoeeiWBSkrjxqFZC2IgyjA&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSx6yT7oBWFeKJH-85mTe_LX8XL5RXw1mRFow&s'],
                description: 'Описание места',
                reviews: ['Отзыв 1', 'Отзыв 2']
            };

            // Добавляем новый маркер в массив маркеров
            markers.current.push(newMarker);

            // Создаем маркер на карте
            const marker = new maplibregl.Marker()
                .setLngLat([lng, lat])
                .addTo(map.current);

            // Добавляем Popup к маркеру
            const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <h3>Информация о месте</h3>
        <p>${newMarker.info}</p>
        <p><strong>Описание:</strong> ${newMarker.description}</p>
        <div>
          <strong>Фотографии:</strong>
          ${newMarker.photos.map((photo) => `<img src="${photo}" alt="Фото" style="width: 100px; margin: 5px;" />`).join('')}
        </div>
        <div>
          <strong>Отзывы:</strong>
          <ul>
            ${newMarker.reviews.map((review, index) => `<li key=${index}>${review}</li>`).join('')}
          </ul>
        </div>
      `);

            // Показываем Popup при клике на маркер
            marker.setPopup(popup);
        });

        // Очистка карты при размонтировании компонента
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []); // Зависимостей нет, карта инициализируется только один раз

    return <div ref={mapContainer} style={{ width: '100%', height: '100vh' }} />;
};

export default MapComponent;