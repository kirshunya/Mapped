package model

type Criteria struct {
	MinRating float64 `json:"min_rating" binding:"omitempty,min=0,max=5"`
	MaxPrice  float64 `json:"max_price" binding:"omitempty,min=0"`
	Location  string  `json:"location" binding:"omitempty"`
	Radius    float64 `json:"radius" binding:"omitempty,min=0"`
	Lat       float64 `json:"lat" binding:"omitempty,numeric"`
	Lon       float64 `json:"lon" binding:"omitempty,numeric"`
}
