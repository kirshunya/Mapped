package handlers

import (
	"github.com/gin-gonic/gin"
	"io"
	"net/http"
)

func SignupHandler(c *gin.Context) {
	// Проксируем запрос к сервису пользователей
	proxyRequest(c, "http://localhost:5000/signup")
}

func LoginHandler(c *gin.Context) {
	// Проксируем запрос к сервису пользователей
	proxyRequest(c, "http://localhost:5000/login")
}

func GetAllPlacesHandler(c *gin.Context) {
	// Проксируем запрос к сервису мест
	proxyRequest(c, "http://localhost:5001/places")
}

func GetPlaceByCoordinatesHandler(c *gin.Context) {
	// Проксируем запрос к сервису мест
	proxyRequest(c, "http://localhost:5001/places/coordinates")
}

func CreatePlaceHandler(c *gin.Context) {
	// Проксируем запрос к сервису мест
	proxyRequest(c, "http://localhost:5001/places")
}

func CreateReviewHandler(c *gin.Context) {
	// Проксируем запрос к сервису мест
	proxyRequest(c, "http://localhost:5001/places/review")
}

func GetPlacesHandler(c *gin.Context) {
	// Проксируем запрос к сервису рекомендаций
	proxyRequest(c, "http://localhost:5002/recommendations")
}

// Функция для проксирования запросов
func proxyRequest(c *gin.Context, url string) {
	req, err := http.NewRequest(c.Request.Method, url, c.Request.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create request"})
		return
	}

	// Копируем заголовки запроса
	for key, value := range c.Request.Header {
		req.Header.Add(key, value[0])
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to proxy request"})
		return
	}
	defer resp.Body.Close()

	// Копируем заголовки и статус ответа
	for key, value := range resp.Header {
		c.Header(key, value[0])
	}
	c.Status(resp.StatusCode)
	c.Writer.WriteHeader(resp.StatusCode)
	body, _ := io.ReadAll(resp.Body)
	c.Writer.Write(body)
}
