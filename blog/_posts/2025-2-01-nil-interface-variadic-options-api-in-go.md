---
title: Nil Interface{} Variadic Options In Go.
date: 2025-2-01
tags:
  - golang
  - api
  - interface
  - testing
author: Ahmed Waleed
location: Dubai, UAE
---

In Go, variadic options provide a flexible way to structure your API, similar to the **functional options** pattern, allowing your API to evolve over time. I assume you're already familiar with functional options—if not, I highly recommend reading [Dave Cheney’s blog](https://dave.cheney.net/2014/10/17/functional-options-for-friendly-apis) on the topic.

A **nil interface variadic options API** functions similarly to the functional options pattern, except that instead of accepting functions, it takes values of type (`any` or `interface{}`). This approach is particularly useful in tests, as it enables reusable, configurable code with less boilerplate than the functional options pattern. However, handling a variadic `any` parameter often requires additional code to process different option types.

Let’s see this in action. The following example defines `runServer`, a test function that initializes a `*TestServer` and invokes the provided test function (`fn`). The function also accepts variadic `any` parameters to configure the `*TestServer` based on the given options.

```go
import (
	"net/http"
	"net/http/httptest"
	"time"
)

type Addr string // Address to listen on. Default is ":0".

type TestServer struct {
	*httptest.Server
	// Wait after *httptest.Server starts
	// and before 	func(*TestServer) runs.
	delay time.Duration
	// Default handler to use
	// in httptest.NewServer.
	h     http.Handler
	addr  Addr
}

// runServer configures and starts a new *TestServer,
// then executes the provided test function.
func runServer(fn func(*TestServer), opts ...any) {
	ts := &TestServer{}

	var h http.Handler
		for _, opt := range opts {
			switch v := opt.(type) {
		case time.Duration:
			ts.delay = v
		case Addr:
			if v == "" {
				v = ":0"
			}
			ts.addr = v
		case http.Handler:
			h = v
		case http.HandlerFunc:
			h = v
		}
	}

	ts.Server = httptest.NewServer(h)
	defer ts.Close()

	time.AfterFunc(ts.delay, func() {
		fn(ts)
	})
}
```
Looking at the `for _, opt := range opts` loop and `switch v := opt.(type)` statement in `runServer`, you’ll notice that handling options requires additional code compared to the functional options pattern. However, the key difference lies in how options are passed when calling runServer. Let's write a example test using runServer and configure it with a few options.

```go
func TestHTTP_StatusOk(t *testing.T) {
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Ok"))
	})

	runServer(func(ts *TestServer) {
		resp, err := http.Get(ts.URL)
		if err != nil {
			t.Fatalf("failed to send request: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Errorf("want status 200, got %d", resp.StatusCode)
		}
	}, time.Millisecond*50, Addr(":8080"), handler)
}
```
Notice how runServer is called with options as values:
```
time.Millisecond*50, Addr(":8080"), handler
```
If we were using a functional options API, the call would look like this:
```
WithDelay(time.Millisecond*50), WithAddr(":8081"), WithHandler(handler)
```
While the difference in usage is minimal, the key difference is in how the API itself is structured. Defining the functional options API requires writing additional functions, as shown below:
```go
// Option defines a function that configures TestServer
type Option func(*TestServer)

// WithDelay sets a delay before running the test function
func WithDelay(d time.Duration) Option {
	return func(ts *TestServer) {
		ts.delay = d
	}
}

// WithAddr sets the address for the server
func WithAddr(addr Addr) Option {
	return func(ts *TestServer) {
		if addr == "" {
			addr = ":0"
		}
		ts.addr = addr
	}
}

// WithHandler sets the HTTP handler
func WithHandler(h http.Handler) Option {
	return func(ts *TestServer) {
		ts.h = h
	}
}
```

### Key Takeaways

The **nil interface options API** is not a replacement for functional options but rather an alternative pattern that can be useful in **tests** where common test utilities require configurable options.

#### **Summary:**
- **Nil interface options** can be useful when designing test utilities.
- **More flexible but prone to incorrect argument order** due to lack of structure.
- **No compile-time type enforcement**, unlike the functional options pattern.

Both patterns have their place—choosing between them depends on the level of flexibility and type safety you need.
