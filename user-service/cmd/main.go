package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"mapped/initializers"
	"mapped/middleware"
	"mapped/model"
	"mapped/user-service/user-handlers"
	"os"
)

func init() {
	initializers.LoadEnv("D:\\Mapped\\.env")
	initializers.Connect()
	err := initializers.DB.AutoMigrate(&model.User{})
	if err != nil {
		panic(err)
	}
}

func main() {
	router := gin.Default()

	router.GET("/", user_handlers.ServerStatus)
	router.POST("/login", user_handlers.LogIn)
	router.POST("/signup", user_handlers.SignUp)

	router.Use(middleware.RequireAuth)

	fmt.Println(os.Getenv("USER_SERVICE_PORT"))
	router.Run(os.Getenv("USER_SERVICE_PORT"))

}
