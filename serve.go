package main

import (
	"net/http"
	"os"
)

var port string
var static string

func init() {
	port = os.Getenv("port")
	static = os.Getenv("static")
}

func main() {
	println(port)
	http.Handle("/", http.FileServer(http.Dir(static)))
	http.ListenAndServe(":"+port, nil)
	println("Shit we crashed")
}