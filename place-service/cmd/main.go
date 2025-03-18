package main

import (
	"fmt"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"mapped/initializers"
	"mapped/model"
	place_handlers "mapped/place-service/place-handlers"
	"os"
)

func init() {
	initializers.LoadEnv("D:\\Mapped\\.env")
	initializers.ConnectEnv()
	err := initializers.DB.AutoMigrate(&model.User{})
	if err != nil {
		panic(err)
	}
}

func main() {
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowAllOrigins: true, // Разрешить все источники
		// Можете настроить более конкретные параметры
		// AllowOrigins:     []string{"http://example.com"}, // Разрешить только определенные источники
		// AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		// AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
	}))

	router.GET("/places", place_handlers.GetAllPlaces)
	router.GET("/places/coordinates", place_handlers.GetPlaceByCoordinates)
	router.POST("/create", place_handlers.CreatePlace)
	router.POST("/create-review", place_handlers.CreateReview)

	fmt.Println(os.Getenv("PLACE_SERVICE_PORT"))
	router.Run(os.Getenv("PLACE_SERVICE_PORT"))

}
