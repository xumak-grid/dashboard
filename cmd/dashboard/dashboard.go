package main

import (
	"log"
	"net"
	"net/http"
	"time"
)

func main() {
	entry := "/dist/index.html"
	static := "/dist/static"
	port := "8081"

	server := NewServer(entry, static, port)
	server.Open()
}

// Server represents an HTTP server.
type Server struct {
	Addr string

	entry  string
	static string
	port   string
}

// NewServer returns a new instance of Server.
//func NewServer(log *logrus.Logger, entry string, static string, port string) *Server {
func NewServer(entry string, static string, port string) *Server {
	return &Server{
		entry:  entry,
		static: static,
		port:   port,
	}
}

// Open opens a socket and serves.
func (server *Server) Open() error {

	log.Println("Starting server at port: " + server.port)

	router := http.NewServeMux()
	router.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir(server.static))))
	router.Handle("/", http.HandlerFunc(IndexHandler(server.entry)))

	srv := &http.Server{
		Handler: router,
		//Addr:    ":" + server.port,
		Addr: net.JoinHostPort("", server.port),
		// Good practice: enforce timeouts for servers you create!
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}
	err := srv.ListenAndServe()
	if err != nil {
		log.Fatal(err)
	}
	return err
}

func IndexHandler(entrypoint string) func(w http.ResponseWriter, req *http.Request) {
	fn := func(w http.ResponseWriter, req *http.Request) {
		http.ServeFile(w, req, entrypoint)
	}
	return http.HandlerFunc(fn)
}
