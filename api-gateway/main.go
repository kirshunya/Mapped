package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"io/ioutil"
	"mapped/initializers"
	"mapped/model"
	"net/http"
	"os"
)

func init() {
	initializers.LoadEnv("D:\\Mapped\\.env")
	initializers.Connect()
	err := initializers.DB.AutoMigrate(&model.User{}, &model.Place{}, &model.Review{})
	if err != nil {
		panic(err)
	}
}

func main() {
	router := gin.Default()

	// Прокси для Service 1
	router.Any("/service1/*path", proxyRequest(fmt.Sprintf("http://localhost%s", os.Getenv("USER_SERVICE_PORT"))))
	// Прокси для Service 2
	router.Any("/service1/*path", proxyRequest(fmt.Sprintf("http://localhost%s", os.Getenv("PLACE_SERVICE_PORT"))))

	router.Run(":8080") // Запуск API Gateway на порту 8080
}

func proxyRequest(target string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Создание нового запроса
		req, err := http.NewRequest(c.Request.Method, target+c.Param("path"), c.Request.Body)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create request"})
			return
		}

		// Копирование заголовков
		for key, value := range c.Request.Header {
			req.Header[key] = value
		}

		// Отправка запроса к целевому сервису
		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to reach service"})
			return
		}
		defer resp.Body.Close()

		for key, value := range resp.Header {
			c.Writer.Header()[key] = value // Копируем все значения заголовка
		}
		c.Writer.WriteHeader(resp.StatusCode)

		// Чтение тела ответа и запись в ответ
		body, _ := ioutil.ReadAll(resp.Body)
		c.Writer.Write(body)
	}
}
