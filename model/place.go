package model

type Place struct {
	ID          uint64   `gorm:"primary_key;auto_increment" json:"id"`
	Name        string   `json:"name"`        // Название достопримечательности
	Description string   `json:"description"` // Описание достопримечательности
	Location    string   `json:"location"`    // Местоположение (город, страна)
	Coordinates struct { // Географические координаты
		Latitude  float64 `json:"latitude"`  // Широта
		Longitude float64 `json:"longitude"` // Долгота
	} `json:"coordinates"`
	OpeningHours string   `json:"opening_hours"` // Часы работы
	AdmissionFee float64  `json:"admission_fee"` // Входная плата
	Images       []string `json:"images"`        // Ссылки на изображения
	Rating       float64  `json:"rating"`        // Рейтинг достопримечательности
	Reviews      []Review `json:"reviews"`       // Отзывы посетителей
}

type Review struct {
	Username string  `json:"username"` // Имя пользователя, оставившего отзыв
	Comment  string  `json:"comment"`  // Текст отзыва
	Rating   float64 `json:"rating"`   // Рейтинг, оставленный пользователем
}
