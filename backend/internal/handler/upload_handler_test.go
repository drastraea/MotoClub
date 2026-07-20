package handler

import (
	"bytes"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// ctxMultipart builds a gin context whose request carries a multipart/form-data
// body with a single "file" field named filename holding content.
func ctxMultipart(filename string, content []byte) (*gin.Context, *httptest.ResponseRecorder) {
	var buf bytes.Buffer
	mw := multipart.NewWriter(&buf)
	part, _ := mw.CreateFormFile("file", filename)
	_, _ = part.Write(content)
	_ = mw.Close()

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodPost, "/uploads", &buf)
	c.Request.Header.Set("Content-Type", mw.FormDataContentType())
	return c, w
}

func TestUploadCreate(t *testing.T) {
	t.Run("missing file field", func(t *testing.T) {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request = httptest.NewRequest(http.MethodPost, "/uploads", strings.NewReader(""))
		c.Request.Header.Set("Content-Type", "multipart/form-data; boundary=x")
		NewUploadHandler(t.TempDir()).Create(c)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	t.Run("oversized file", func(t *testing.T) {
		c, w := ctxMultipart("big.png", bytes.Repeat([]byte("a"), maxUploadSize+1))
		NewUploadHandler(t.TempDir()).Create(c)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	t.Run("unsupported file type", func(t *testing.T) {
		c, w := ctxMultipart("file.txt", []byte("hello"))
		NewUploadHandler(t.TempDir()).Create(c)
		assert.Equal(t, http.StatusBadRequest, w.Code)
		assert.Contains(t, w.Body.String(), "unsupported file type")
	})

	t.Run("success", func(t *testing.T) {
		dir := t.TempDir()
		c, w := ctxMultipart("selfie.png", []byte("fake-image-bytes"))
		c.Request.Host = "localhost:8080"
		NewUploadHandler(dir).Create(c)
		require.Equal(t, http.StatusCreated, w.Code)
		assert.Contains(t, w.Body.String(), `"link":"http://localhost:8080/uploads/`)

		entries, err := os.ReadDir(dir)
		require.NoError(t, err)
		require.Len(t, entries, 1)
		assert.Equal(t, ".png", filepath.Ext(entries[0].Name()))
		data, err := os.ReadFile(filepath.Join(dir, entries[0].Name()))
		require.NoError(t, err)
		assert.Equal(t, "fake-image-bytes", string(data))
	})
}
