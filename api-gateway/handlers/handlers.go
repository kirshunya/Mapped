package handlers

import (
	"github.com/gin-gonic/gin"
	"io"
	_ "mapped/model"
	"net/http"
)

// @Summary      User signup
// @Description  Create a new user
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        user  body      model.User  true  "User data"
// @Success      200   {object}  model.User
// @Failure      400   {object}  gin.H{"error": "error message"}
// @Router       /signup [post]
func SignupHandler(c *gin.Context) {
	// Проксируем запрос к сервису пользователей
	proxyRequest(c, "http://localhost:8081/signup")
}

// @Summary      User login
// @Description  Authenticate a user and return a token
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        body  body      struct{ Email string; Password string }  true  "User credentials"
// @Success      200   {object}  gin.H{"status": "Success"}
// @Failure      400   {object}  gin.H{"error": "error message"}
// @Router       /login [post]
func LoginHandler(c *gin.Context) {
	// Проксируем запрос к сервису пользователей
	proxyRequest(c, "http://localhost:8081/login")
}

func GetUser(c *gin.Context) {
	proxyRequest(c, "http://localhost:8081/user")
}

// @Summary      Get all places
// @Description  Retrieve all places from the service
// @Tags         places
// @Success      200   {array}   model.Place
// @Failure      502   {object}  gin.H{"error": "error message"}
// @Router       /places [get]
func GetAllPlacesHandler(c *gin.Context) {
	// Проксируем запрос к сервису мест
	proxyRequest(c, "http://localhost:8082/places")
}

// @Summary      Get place by coordinates
// @Description  Retrieve a place by its latitude and longitude
// @Tags         places
// @Param        latitude  query  string  true  "Latitude"
// @Param        longitude query  string  true  "Longitude"
// @Success      200       {object}  model.Place
// @Failure      404       {object}  gin.H{"error": "Place not found"}
// @Router       /places/coordinates [get]
func GetPlaceByCoordinatesHandler(c *gin.Context) {
	// Проксируем запрос к сервису мест
	proxyRequest(c, "http://localhost:8082/places/coordinates")
}

// @Summary      Create a place
// @Description  Create a new place
// @Tags         places
// @Accept       json
// @Produce      json
// @Param        place  body      model.Place  true  "Place data"
// @Success      200    {object}  model.Place
// @Failure      400    {object}  gin.H{"error": "error message"}
// @Router       /places [post]
func CreatePlaceHandler(c *gin.Context) {
	// Проксируем запрос к сервису мест
	proxyRequest(c, "http://localhost:8082/places")
}

// @Summary      Create a review
// @Description  Add a review to a specific place
// @Tags         reviews
// @Accept       json
// @Produce      json
// @Param        review  body      model.Review  true  "Review data"
// @Success      200     {object}  gin.H{"status": "Review created", "data": model.Review}
// @Failure      400     {object}  gin.H{"error": "error message"}
// @Router       /places/review [post]
func CreateReviewHandler(c *gin.Context) {
	// Проксируем запрос к сервису мест
	proxyRequest(c, "http://localhost:8082/places/review")
}

// @Summary      Get recommended places
// @Description  Retrieve places based on given criteria
// @Tags         recommendations
// @Accept       json
// @Produce      json
// @Param        criteria  body      model.Criteria  true  "Criteria for recommendations"
// @Success      200       {array}   model.Place
// @Failure      400       {object}  gin.H{"error": "error message"}
// @Failure      500       {object}  gin.H{"error": "error message"}
// @Router       /recommendations [post]
func GetPlacesHandler(c *gin.Context) {
	// Проксируем запрос к сервису рекомендаций
	proxyRequest(c, "http://localhost:8083/recommendations")
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

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read response body"})
		return
	}
	c.Writer.Write(body)
}
