package main

import (
	"fmt"
	"mapped/initializers"
	"mapped/middleware"
	"mapped/model"
	user_handlers "mapped/user-service/user-handlers"
	"os"

	"github.com/gin-gonic/gin"
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
	//cfg := config.MustLoad()
	router := gin.Default()

	router.GET("/", user_handlers.ServerStatus)
	router.GET("/user", user_handlers.GetUserByID)
	router.POST("/login", user_handlers.LogIn)
	router.POST("/signup", user_handlers.SignUp)

	router.Use(middleware.RequireAuth)

	fmt.Println(os.Getenv("USER_SERVICE_PORT"))
	router.Run(os.Getenv("USER_SERVICE_PORT"))
}
