package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"mapped/config"
	"mapped/initializers"
	"mapped/model"
	place_handlers "mapped/place-service/place-handlers"
	"os"
)

func init() {
	cfg := config.MustLoad()
	initializers.Connect(cfg)
	err := initializers.DB.AutoMigrate(&model.User{})
	if err != nil {
		panic(err)
	}
}

func main() {
	router := gin.Default()

	router.GET("/places", place_handlers.GetAllPlaces)
	router.GET("/places/coordinates", place_handlers.GetPlaceByCoordinates)
	router.POST("/create", place_handlers.CreatePlace)
	router.POST("/create-review", place_handlers.CreateReview)

	fmt.Println(os.Getenv("PLACE_SERVICE_PORT"))
	router.Run(os.Getenv("PLACE_SERVICE_PORT"))

}
