package handler

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/edberto/motoclub-backend/internal/apperr"
	"github.com/edberto/motoclub-backend/internal/httpx"
)

const maxUploadSize = 20 << 20 // 20MB

var allowedUploadExt = map[string]bool{
	".jpg": true, ".jpeg": true, ".png": true, ".webp": true, ".gif": true,
}

// UploadHandler stores images on local disk (backed by a mounted volume) and
// returns a URL the caller stores wherever a link/imageLink field is needed
// (gallery item, event banner, motorbike selfie, ...).
type UploadHandler struct {
	dir string // filesystem directory served at /uploads
}

// NewUploadHandler constructs an UploadHandler backed by dir.
func NewUploadHandler(dir string) *UploadHandler {
	return &UploadHandler{dir: dir}
}

// Create handles POST /uploads. Public/no-auth: the registration selfie must
// upload before an account (and JWT) exists, so this can't be an authed-only
// route; abuse is bounded by per-IP rate limiting (see middleware.RateLimit)
// plus the size/type checks below.
func (h *UploadHandler) Create(c *gin.Context) {
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxUploadSize)
	if err := c.Request.ParseMultipartForm(maxUploadSize); err != nil {
		httpx.Error(c, fmt.Errorf("%w: %s (max 20MB, multipart/form-data with a \"file\" field)", apperr.ErrValidation, err.Error()))
		return
	}
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		httpx.Error(c, fmt.Errorf("%w: missing \"file\" field", apperr.ErrValidation))
		return
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedUploadExt[ext] {
		httpx.Error(c, fmt.Errorf("%w: unsupported file type %q", apperr.ErrValidation, ext))
		return
	}

	if err := os.MkdirAll(h.dir, 0o755); err != nil {
		httpx.Error(c, err)
		return
	}
	name, err := randomFilename(ext)
	if err != nil {
		httpx.Error(c, err)
		return
	}
	dst, err := os.Create(filepath.Join(h.dir, name))
	if err != nil {
		httpx.Error(c, err)
		return
	}
	defer dst.Close()
	if _, err := io.Copy(dst, file); err != nil {
		httpx.Error(c, err)
		return
	}

	scheme := "http"
	if c.Request.TLS != nil {
		scheme = "https"
	}
	if proto := c.GetHeader("X-Forwarded-Proto"); proto != "" {
		scheme = proto
	}
	link := fmt.Sprintf("%s://%s/uploads/%s", scheme, c.Request.Host, name)
	c.JSON(http.StatusCreated, gin.H{"link": link})
}

func randomFilename(ext string) (string, error) {
	buf := make([]byte, 16)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return hex.EncodeToString(buf) + ext, nil
}
