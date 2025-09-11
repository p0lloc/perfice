package main

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"slices"
	"strings"

	"github.com/gofiber/fiber/v2"
	"perfice.adoe.dev/util"
)

type RequestForwarder struct {
	baseUrl          string
	authMiddleware   fiber.Handler
	httpClient       *http.Client
	router           *fiber.Router
	authenticated    bool
	forwardedHeaders []string
}

func (r *RequestForwarder) forwardRequest(httpClient http.Client, c *fiber.Ctx, route *ForwardedRoute) error {
	remoteUrl := r.baseUrl + route.remotePath
	if len(route.params) > 0 {
		mappedParams := util.SliceMap(route.params, func(val string) any {
			var res any // Must be converted to any to pass into fmt.Sprintf
			res = c.Params(val)
			return res
		})

		remoteUrl = fmt.Sprintf(remoteUrl, mappedParams...)
	}

	req, err := http.NewRequest(c.Method(), remoteUrl, bytes.NewReader(c.Body()))
	if err != nil {
		return err
	}

	queries := c.Queries()
	forwardQuery := req.URL.Query()
	for key, value := range queries {
		forwardQuery.Add(key, value)
	}

	req.URL.RawQuery = forwardQuery.Encode()

	c.Request().Header.VisitAll(func(key, value []byte) {
		keyString := strings.ToLower(string(key))
		if !slices.Contains(route.forwardHeaders, keyString) && !slices.Contains(r.forwardedHeaders, keyString) {
			return
		}

		req.Header.Set(keyString, string(value))
	})

	if val := c.Locals(userIdLocal); val != nil {
		req.Header.Set("x-userid", val.(string))
	}

	if val := c.Locals(sessionIdLocal); val != nil {
		req.Header.Set("x-sessionid", val.(string))
	}

	if route.forwardCookies != nil {
		for _, cookie := range route.forwardCookies {
			token := c.Cookies(cookie)
			req.AddCookie(&http.Cookie{
				Name:  cookie,
				Value: token,
			})
		}
	}

	resp, err := httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	for k, v := range resp.Header {
		for _, val := range v {
			c.Set(k, val)
		}
	}

	c.Status(resp.StatusCode)

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	return c.Send(body)
}

func (r *RequestForwarder) handlerNew(route *ForwardedRoute) []fiber.Handler {
	var handlers []fiber.Handler
	if route.authenticated {
		handlers = append(handlers, r.authMiddleware)
	}

	handlers = append(handlers, func(c *fiber.Ctx) error {
		err := r.forwardRequest(*r.httpClient, c, route)
		if err != nil {
			fmt.Println(err)
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		return nil
	})

	return handlers
}

type ForwardedRoute struct {
	path           string
	method         string
	remotePath     string
	params         []string
	handler        []fiber.Handler
	authenticated  bool
	forwardCookies []string
	forwardHeaders []string

	forwarder *RequestForwarder
}

func (r *ForwardedRoute) Cookies(cookies ...string) *ForwardedRoute {
	r.forwardCookies = cookies
	return r
}

func (r *ForwardedRoute) Headers(headers ...string) *ForwardedRoute {
	r.forwardHeaders = headers
	return r
}

func (r *ForwardedRoute) Authenticated() *ForwardedRoute {
	r.authenticated = true
	return r
}

func (r *RequestForwarder) Route(path string, remotePath string, method string, params ...string) *ForwardedRoute {
	route := ForwardedRoute{
		path:          path,
		remotePath:    remotePath,
		method:        method,
		params:        params,
		authenticated: r.authenticated,
		forwarder:     r,
	}

	return &route
}

func (r *ForwardedRoute) Forward() {
	(*r.forwarder.router).Add(r.method, r.path, r.forwarder.handlerNew(r)...)
}

func (r *RequestForwarder) Get(path string, remotePath string, params ...string) *ForwardedRoute {
	return r.Route(path, remotePath, fiber.MethodGet, params...)
}

func (r *RequestForwarder) Put(path string, remotePath string, params ...string) *ForwardedRoute {
	return r.Route(path, remotePath, fiber.MethodPut, params...)
}

func (r *RequestForwarder) Post(path string, remotePath string, params ...string) *ForwardedRoute {
	return r.Route(path, remotePath, fiber.MethodPost, params...)
}

func (r *RequestForwarder) Delete(path string, remotePath string, params ...string) *ForwardedRoute {
	return r.Route(path, remotePath, fiber.MethodDelete, params...)
}

func newRequestForwarder(baseUrl string, authMiddleware fiber.Handler, httpClient *http.Client, router *fiber.Router, authenticated bool) *RequestForwarder {
	return &RequestForwarder{baseUrl, authMiddleware, httpClient,
		router, authenticated, []string{"content-type"}}
}

func newRequestForwarderWithHeaders(baseUrl string, authMiddleware fiber.Handler, httpClient *http.Client, router *fiber.Router,
	authenticated bool, forwardedHeaders []string) *RequestForwarder {

	return &RequestForwarder{baseUrl, authMiddleware, httpClient,
		router, authenticated, forwardedHeaders}
}
