import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

const MapComponent = () => {
    const [places, setPlaces] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8085/places')
            .then(response => {
                console.log("Данные с бэкенда:", response.data.places); // Используем response.data.places
                setPlaces(response.data.places); // Устанавливаем данные из поля places
            })
            .catch(error => {
                console.error("Ошибка при загрузке данных:", error);
            });
    }, []);

    const icon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });

    return (
        <MapContainer
            center={[48.8588443, 2.2943506]} // Центр карты (Эйфелева башня)
            zoom={13}
            style={{ height: '100vh', width: '100%' }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {places.map(place => (
                <Marker
                    key={place.id}
                    position={[place.latitude, place.longitude]} // Координаты из данных
                    icon={icon}
                >
                    <Popup>
                        <div>
                            <h3>{place.name}</h3>
                            <p>{place.description}</p>
                            <p><strong>Местоположение:</strong> {place.location}</p>
                            <p><strong>Часы работы:</strong> {place.opening_hours}</p>
                            <p><strong>Стоимость входа:</strong> ${place.admission_fee}</p>
                            <p><strong>Рейтинг:</strong> {place.rating}</p>
                            <div>
                                <h4>Фотографии:</h4>
                                {place.images.map((image, index) => (
                                    <img
                                        key={index}
                                        src={image}
                                        alt={`${place.name} ${index}`}
                                        style={{ width: '100px', height: 'auto', margin: '5px' }}
                                    />
                                ))}
                            </div>
                            <div>
                                <h4>Отзывы:</h4>
                                {place.reviews.length > 0 ? (
                                    place.reviews.map(review => (
                                        <div key={review.id}>
                                            <p><strong>{review.username}</strong>: {review.comment} (Рейтинг: {review.rating})</p>
                                        </div>
                                    ))
                                ) : (
                                    <p>Отзывов пока нет.</p>
                                )}
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapComponent;