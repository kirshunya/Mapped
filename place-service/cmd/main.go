package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"mapped/middleware"
	"mapped/user-service/user-handlers"
	"os"
)

func main() {
	router := gin.Default()

	router.GET("/", user_handlers.ServerStatus)
	router.POST("/login", user_handlers.LogIn)
	router.POST("/signup", user_handlers.SignUp)

	router.Use(middleware.RequireAuth)

	fmt.Println(os.Getenv("USER_SERVICE_PORT"))
	router.Run(os.Getenv("USER_SERVICE_PORT"))

}
