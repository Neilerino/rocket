package main

import (
	"backend/cmd"
	"flag"
	"fmt"
	"os"
)

func main() {
	serverCmd := flag.NewFlagSet("server", flag.ExitOnError)
	migrateCmd := flag.NewFlagSet("migrate", flag.ExitOnError)

	if len(os.Args) < 2 {
		fmt.Println("expected 'server' or 'migrate' subcommands")
		os.Exit(1)
	}

	switch os.Args[1] {
	case "server":
		serverCmd.Parse(os.Args[2:])
		cmd.Server()
	case "migrate":
		migrateCmd.Parse(os.Args[2:])
		cmd.Migrate()
	default:
		fmt.Println("expected 'server' or 'migrate' subcommands")
		os.Exit(1)
	}
}
