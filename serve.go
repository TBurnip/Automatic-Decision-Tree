//usr/local/go/bin/go run $0 $@ ; exit
package main

import (
	"net/http"
	"os"
)

var port string
var static string

func init() {
	port = os.Getenv("port")
	if port == "" {
		port = "80"
	}
	static = os.Getenv("static")
	if static == "" {
		static = "static"
	}
}

func main() {
	println(port)
	http.Handle("/", http.FileServer(http.Dir(static)))
	http.ListenAndServe(":"+port, nil)
	println("Oops... we've crashed")
}
