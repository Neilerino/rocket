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
		err := serverCmd.Parse(os.Args[2:])
		if err != nil {
			fmt.Println("error parsing server command:", err)
			os.Exit(1)
		}
		cmd.Server()
	case "migrate":
		err := migrateCmd.Parse(os.Args[2:])
		if err != nil {
			fmt.Println("error parsing migrate command:", err)
			os.Exit(1)
		}
		cmd.Migrate()
	default:
		fmt.Println("expected 'server' or 'migrate' subcommands")
		os.Exit(1)
	}
}
