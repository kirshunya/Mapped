package main

// @title MMapped
// @version 1.0
// @description This is a sample API microservice.
// @host localhost:8085
// @BasePath /

import (
	"github.com/gin-gonic/gin"
	"github.com/swaggo/files" // Добавьте этот импорт
	ginSwagger "github.com/swaggo/gin-swagger"
	_ "mapped/api-gateway/cmd/docs"
	"mapped/api-gateway/handlers"
	"mapped/initializers"
	"mapped/model"
)

func init() {
	initializers.LoadEnv("D:\\Mapped\\.env")
	initializers.ConnectEnv()
	err := initializers.DB.AutoMigrate(&model.User{}, &model.Place{}, &model.Review{})
	if err != nil {
		panic(err)
	}
}

func main() {
	r := gin.Default()

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	// Маршруты для пользователей
	r.POST("/signup", handlers.SignupHandler)
	r.POST("/login", handlers.LoginHandler)

	// Маршруты для мест
	r.GET("/places", handlers.GetPlacesHandler)
	r.GET("/places/coordinates", handlers.GetPlaceByCoordinatesHandler)
	r.POST("/places", handlers.CreatePlaceHandler)
	r.POST("/places/review", handlers.CreateReviewHandler)

	// Маршрут для рекомендаций
	r.POST("/recommendations", handlers.GetPlacesHandler)

	// Запустите сервер
	r.Run(":8085")
}
