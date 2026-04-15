package service

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/mapsocial/auth-service/internal/models"
	"github.com/mapsocial/auth-service/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	repo      *repository.AuthRepository
	jwtSecret string
	jwtExpiry time.Duration
}

func NewAuthService(repo *repository.AuthRepository, jwtSecret string, jwtExpiry time.Duration) *AuthService {
	return &AuthService{repo: repo, jwtSecret: jwtSecret, jwtExpiry: jwtExpiry}
}

func (s *AuthService) Register(req *models.RegisterRequest) (*models.AuthResponse, error) {
	existing, _ := s.repo.GetUserByEmail(req.Email)
	if existing != nil {
		return nil, errors.New("email already registered")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		Email:    req.Email,
		Username: req.Username,
		Password: string(hashedPassword),
		Role:     models.RoleUser,
		IsActive: true,
	}

	if err := s.repo.CreateUser(user); err != nil {
		return nil, err
	}

	token, err := s.generateToken(user.ID, string(user.Role))
	if err != nil {
		return nil, err
	}

	return &models.AuthResponse{Token: token, User: *user}, nil
}

func (s *AuthService) Login(req *models.LoginRequest) (*models.AuthResponse, error) {
	user, err := s.repo.GetUserByEmail(req.Email)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid credentials")
	}

	if !user.IsActive {
		return nil, errors.New("account is disabled")
	}

	token, err := s.generateToken(user.ID, string(user.Role))
	if err != nil {
		return nil, err
	}

	return &models.AuthResponse{Token: token, User: *user}, nil
}

func (s *AuthService) GetUserByID(id uint) (*models.User, error) {
	return s.repo.GetUserByID(id)
}

func (s *AuthService) GetAllUsers() ([]models.User, error) {
	return s.repo.GetAllUsers()
}

func (s *AuthService) UpdateUser(userID uint, req *models.UpdateUserRequest) (*models.User, error) {
	user, err := s.repo.GetUserByID(userID)
	if err != nil {
		return nil, err
	}

	if req.Username != "" {
		user.Username = req.Username
	}
	if req.Avatar != "" {
		user.Avatar = req.Avatar
	}
	if req.Bio != "" {
		user.Bio = req.Bio
	}

	err = s.repo.UpdateUser(user)
	return user, err
}

func (s *AuthService) ChangeRole(adminID uint, req *models.ChangeRoleRequest) error {
	admin, err := s.repo.GetUserByID(adminID)
	if err != nil {
		return errors.New("admin not found")
	}
	if admin.Role != models.RoleAdmin {
		return errors.New("only admin can change roles")
	}

	return s.repo.UpdateRole(req.UserID, req.Role)
}

func (s *AuthService) SearchUsers(query string, limit int, excludeID uint) ([]models.User, error) {
	return s.repo.SearchUsers(query, limit, excludeID)
}

func (s *AuthService) ValidateToken(tokenString string) (uint, string, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(s.jwtSecret), nil
	})

	if err != nil || !token.Valid {
		return 0, "", errors.New("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return 0, "", errors.New("invalid claims")
	}

	userID := uint(claims["user_id"].(float64))
	role := claims["role"].(string)
	return userID, role, nil
}

func (s *AuthService) generateToken(userID uint, role string) (string, error) {
	user, _ := s.repo.GetUserByID(userID)
	username := ""
	avatar := ""
	if user != nil {
		username = user.Username
		avatar = user.Avatar
	}
	claims := jwt.MapClaims{
		"user_id":  userID,
		"role":     role,
		"username": username,
		"avatar":   avatar,
		"exp":      time.Now().Add(s.jwtExpiry).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}
