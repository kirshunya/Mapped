package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"mapped/initializers"
	"mapped/model"
	place_handlers "mapped/place-service/place-handlers"
	"os"
)

func init() {
	initializers.LoadEnv("D:\\Mapped\\.env")
	initializers.Connect()
	err := initializers.DB.AutoMigrate(&model.Place{}, &model.Review{})
	if err != nil {
		panic(err)
	}
}

func main() {
	router := gin.Default()

	//router.GET("/", user_handlers.ServerStatus)
	//router.POST("/login", user_handlers.LogIn)
	//router.POST("/signup", user_handlers.SignUp)
	//
	//router.Use(middleware.RequireAuth)

	router.GET("/", place_handlers.GetAllPlaces)
	router.POST("/create", place_handlers.CreatePlace)
	router.POST("/create-review", place_handlers.CreateReview)

	fmt.Println(os.Getenv("PLACE_SERVICE_PORT"))
	router.Run(os.Getenv("PLACE_SERVICE_PORT"))

}
