package main

import (
	"fmt"
	"mapped/config"
	"mapped/initializers"
	"mapped/middleware"
	"mapped/model"
	user_handlers "mapped/user-service/user-handlers"

	"github.com/gin-gonic/gin"
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
	cfg := config.MustLoad()
	router := gin.Default()

	router.GET("/", user_handlers.ServerStatus)
	router.POST("/login", user_handlers.LogIn)
	router.POST("/signup", user_handlers.SignUp)

	router.Use(middleware.RequireAuth)

	fmt.Println(cfg.User.Port)
	router.Run(cfg.User.Port)
}
