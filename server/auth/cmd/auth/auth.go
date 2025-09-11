package main

import "perfice.adoe.dev/auth/internal"

func main() {
	app := internal.NewAuthApp()
	app.Init()
}
