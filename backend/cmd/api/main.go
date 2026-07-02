// Command api is the MotoClub backend HTTP server entrypoint. It wires
// configuration, the database pool, repositories, services and handlers, then
// serves until interrupted.
package main

import (
	"context"
	"log"
	"os/signal"
	"syscall"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/edberto/motoclub-backend/internal/auth"
	"github.com/edberto/motoclub-backend/internal/config"
	"github.com/edberto/motoclub-backend/internal/handler"
	"github.com/edberto/motoclub-backend/internal/repository/postgres"
	"github.com/edberto/motoclub-backend/internal/server"
	"github.com/edberto/motoclub-backend/internal/service"
	"github.com/edberto/motoclub-backend/internal/util"
)

func main() {
	if err := run(); err != nil {
		log.Fatalf("fatal: %v", err)
	}
}

func run() error {
	cfg, err := config.LoadFromOS()
	if err != nil {
		return err
	}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	pool, err := pgxpool.New(ctx, cfg.DatabaseURL)
	if err != nil {
		return err
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		return err
	}

	repos := postgres.New(pool)
	clock := util.RealClock{}
	jwtMgr := auth.NewHMACManager(cfg.JWTSecret, cfg.TokenTTL, clock)
	verifier := auth.NewGoogleVerifier(cfg.GoogleClientID)

	handlers := &handler.Handlers{
		Auth:         handler.NewAuthHandler(service.NewAuthService(repos.Members, repos.Tokens, verifier, jwtMgr)),
		Member:       handler.NewMemberHandler(service.NewMemberService(repos.Members, clock)),
		Event:        handler.NewEventHandler(service.NewEventService(repos.Events)),
		Announcement: handler.NewAnnouncementHandler(service.NewAnnouncementService(repos.Announcements)),
		Gallery:      handler.NewGalleryHandler(service.NewGalleryService(repos.Gallery)),
	}

	gin.SetMode(gin.ReleaseMode)
	router := server.NewRouter(handlers, jwtMgr, repos.Tokens)

	log.Printf("listening on :%s", cfg.Port)
	return server.Run(ctx, ":"+cfg.Port, router)
}
