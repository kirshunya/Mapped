// Profile.js

import React, { useState } from 'react';

const Profile = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleModal = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <img
                src={user.photo || 'default-profile.png'} // Замените на путь к изображению по умолчанию
                alt="Profile"
                onClick={toggleModal}
                style={{ width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer' }}
            />
            {isOpen && (
                <div className="modal"> 
                    <div className="modal-content">
                        <span className="close" onClick={toggleModal}>&times;</span>
                        <h2>Профиль</h2>
                        <p><strong>Имя:</strong> {user.name}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Возраст:</strong> {user.age}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;