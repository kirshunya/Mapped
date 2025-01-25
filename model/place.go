package model

import (
	"github.com/lib/pq"
)

type Place struct {
	ID           uint64         `gorm:"primary_key;auto_increment" json:"id"`
	Name         string         `json:"name"`
	Description  string         `json:"description"`
	Location     string         `json:"location"`
	Latitude     float64        `json:"latitude"`  // Широта
	Longitude    float64        `json:"longitude"` // Долгота
	OpeningHours string         `json:"opening_hours"`
	AdmissionFee float64        `json:"admission_fee"`
	Images       pq.StringArray `gorm:"type:text[]" json:"images"` // Используется для PostgreSQL
	Rating       float64        `json:"rating"`
	Reviews      []Review       `gorm:"foreignKey:PlaceID" json:"reviews"` // Добавлено указание на внешний ключ
}

type Review struct {
	ID       uint64  `gorm:"primary_key;auto_increment" json:"id"`
	Username string  `gorm:"unique" json:"username"` // Имя пользователя, оставившего отзыв
	Comment  string  `json:"comment"`                // Текст отзыва
	Rating   float64 `json:"rating"`                 // Рейтинг, оставленный пользователем
	PlaceID  uint64  `json:"place_id"`               // Внешний ключ для связи с Place
}

type Coordinates struct {
	Latitude  float64 `json:"latitude"`  // Широта
	Longitude float64 `json:"longitude"` // Долгота
}
