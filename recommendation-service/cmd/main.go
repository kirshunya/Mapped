package main

import (
	"fmt"
	"mapped/config"
	"mapped/initializers"
	"mapped/model"
	recommendation_handlers "mapped/recommendation-service/handlers"

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

	router.POST("/recommendation", recommendation_handlers.GetPlaces)

	fmt.Println(cfg.Recommendation.Port)
	router.Run(cfg.Recommendation.Port)

}
