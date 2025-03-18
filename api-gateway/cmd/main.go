package main

// @title Mapped
// @version 1.0
// @description This is a sample API microservice.
// @host localhost:8085
// @BasePath /

import (
	"github.com/gin-contrib/cors"
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

// @title           Swagger Example API
// @version         1.0
// @description     This is a sample server celler server.
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support
// @contact.url    http://www.swagger.io/support
// @contact.email  support@swagger.io

// @license.name  Apache 2.0
// @license.url   http://www.apache.org/licenses/LICENSE-2.0.html

// @host      localhost:8080
// @BasePath  /api/v1

// @securityDefinitions.basic  BasicAuth

// @externalDocs.description  OpenAPI
// @externalDocs.url          https://swagger.io/resources/open-api/

func main() {
	r := gin.Default()
	r.Use(cors.Default())
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	r.GET("/user", handlers.GetUser)
	r.POST("/signup", handlers.SignupHandler)
	r.POST("/login", handlers.LoginHandler)

	// Маршруты для мест
	r.GET("/places", handlers.GetAllPlacesHandler)
	r.GET("/places/coordinates", handlers.GetPlaceByCoordinatesHandler)
	r.POST("/places", handlers.CreatePlaceHandler)
	r.POST("/places/review", handlers.CreateReviewHandler)

	// Маршрут для рекомендаций
	r.POST("/recommendations", handlers.GetPlacesHandler)

	// Запустите сервер
	r.Run(":8085")
}
