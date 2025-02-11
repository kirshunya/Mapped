package main

import (
	"fmt"
	"mapped/config"
	"mapped/initializers"
	"mapped/model"
	place_handlers "mapped/place-service/place-handlers"

	"github.com/gin-gonic/gin"
)

func init() {
	cfg := config.MustLoad()
	initializers.Connect(cfg)
	err := initializers.DB.AutoMigrate(&model.Place{}, &model.Review{})
	if err != nil {
		panic(err)
	}
}

func main() {
	cfg := config.MustLoad()
	router := gin.Default()

	router.GET("/", place_handlers.GetAllPlaces)
	router.GET("/places/coordinates", place_handlers.GetPlaceByCoordinates)
	router.POST("/create", place_handlers.CreatePlace)
	router.POST("/create-review", place_handlers.CreateReview)

	fmt.Println(cfg.Place.Port)
	router.Run(cfg.Place.Port)

}
