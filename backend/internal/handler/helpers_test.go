package handler

import (
	"io"
	"net/http/httptest"
	"strings"

	"github.com/gin-gonic/gin"
)

func init() { gin.SetMode(gin.TestMode) }

// ctxJSON builds a gin context whose request carries the given JSON body.
func ctxJSON(method, target, body string) (*gin.Context, *httptest.ResponseRecorder) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	var r io.Reader
	if body != "" {
		r = strings.NewReader(body)
	}
	c.Request = httptest.NewRequest(method, target, r)
	c.Request.Header.Set("Content-Type", "application/json")
	return c, w
}

func setParam(c *gin.Context, key, val string) {
	c.Params = append(c.Params, gin.Param{Key: key, Value: val})
}
