// Command api is the MotoClub backend HTTP server entrypoint. It wires
// configuration, the database pool, repositories, services and handlers, then
// serves until interrupted.
package main

import (
	"context"
	"log/slog"
	"os"
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
	cfg, err := config.LoadFromOS()
	if err != nil {
		slog.Error("failed to load config", "error", err.Error())
		os.Exit(1)
	}

	logger := newLogger(cfg.LogLevel, cfg.LogFormat)
	slog.SetDefault(logger)

	if err := run(cfg, logger); err != nil {
		logger.Error("fatal", "error", err.Error())
		os.Exit(1)
	}
}

// newLogger builds the structured logger from the config's log level
// (debug|info|warn|error) and format (json|text).
func newLogger(level, format string) *slog.Logger {
	var lvl slog.Level = slog.LevelInfo
	if level != "" {
		_ = lvl.UnmarshalText([]byte(level))
	}
	opts := &slog.HandlerOptions{Level: lvl}

	var h slog.Handler = slog.NewJSONHandler(os.Stdout, opts)
	if format == "text" {
		h = slog.NewTextHandler(os.Stdout, opts)
	}
	return slog.New(h)
}

func run(cfg config.Config, logger *slog.Logger) error {
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
	jwtMgr := auth.NewHMACManager(cfg.JWTSecret, cfg.AccessTTL, cfg.RefreshTTL, clock)
	verifier := auth.NewGoogleVerifier(cfg.GoogleClientID)

	handlers := &handler.Handlers{
		Auth:         handler.NewAuthHandler(service.NewAuthService(repos.Members, repos.Tokens, verifier, jwtMgr)),
		Member:       handler.NewMemberHandler(service.NewMemberService(repos.Members, clock)),
		Event:        handler.NewEventHandler(service.NewEventService(repos.Events)),
		Announcement: handler.NewAnnouncementHandler(service.NewAnnouncementService(repos.Announcements)),
		Gallery:      handler.NewGalleryHandler(service.NewGalleryService(repos.Gallery)),
	}

	gin.SetMode(gin.ReleaseMode)
	router := server.NewRouter(handlers, jwtMgr, repos.Tokens, logger, cfg.AllowedOrigins)

	logger.Info("listening", "port", cfg.Port)
	return server.Run(ctx, ":"+cfg.Port, router)
}
