package model

type User struct {
	ID       uint64 `gorm:"primary_key;auto_increment" json:"id"`
	Email    string `gorm:"size:255;unique" json:"email"`
	Name     string `gorm:"size:255" json:"name"`
	Password string `gorm:"size:255" json:"password"`
	Age      uint8  `json:"age"`
}
