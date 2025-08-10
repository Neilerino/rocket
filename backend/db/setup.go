package db

import (
	"context"
	"embed"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

//go:embed sql/*
var sqlFiles embed.FS

func loadSQL(filename string) (string, error) {
	data, err := sqlFiles.ReadFile(fmt.Sprintf("sql/%s", filename))
	if err != nil {
		return "", fmt.Errorf("error reading SQL file %s: %w", filename, err)
	}
	return string(data), nil
}

func loadSQLFiles(prefix string) ([]string, error) {
	entries, err := sqlFiles.ReadDir("sql")
	if err != nil {
		return nil, fmt.Errorf("error reading SQL directory: %w", err)
	}

	var queries []string
	for _, entry := range entries {
		if !entry.IsDir() && strings.HasPrefix(entry.Name(), prefix) {
			query, err := loadSQL(entry.Name())
			if err != nil {
				return nil, err
			}
			queries = append(queries, query)
		}
	}
	return queries, nil
}

type Database struct {
	pool *pgxpool.Pool
}

func (db *Database) Begin(ctx context.Context) (pgx.Tx, error) {
	return db.pool.Begin(ctx)
}

func (db *Database) TxQueries(ctx context.Context) (*Queries, pgx.Tx, error) {
	tx, err := db.pool.Begin(ctx)
	if err != nil {
		return nil, nil, fmt.Errorf("error starting transaction: %w", err)
	}

	return &Queries{
		db: tx,
	}, tx, nil
}

func Initialize(dataSourceName string) (*Database, error) {
	config, err := pgxpool.ParseConfig(dataSourceName)
	if err != nil {
		return nil, fmt.Errorf("error parsing database config: %w", err)
	}

	config.MaxConns = 25
	config.MinConns = 5
	config.MaxConnLifetime = time.Hour
	config.MaxConnIdleTime = 30 * time.Minute

	pool, err := pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		return nil, fmt.Errorf("error creating connection pool: %w", err)
	}

	if err := pool.Ping(context.Background()); err != nil {
		return nil, fmt.Errorf("error connecting to database: %w", err)
	}

	db := &Database{
		pool: pool,
	}

	return db, nil
}

func (db *Database) Close() {
	db.pool.Close()
}

func (db *Database) InitializeTables() error {
	schemaQueries, err := loadSQLFiles("schema")
	if err != nil {
		return fmt.Errorf("error loading schema files: %w", err)
	}

	ctx := context.Background()
	tx, err := db.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("error starting transaction: %w", err)
	}

	for _, query := range schemaQueries {
		fmt.Println(query)
		if _, err := tx.Exec(ctx, query); err != nil {
			return fmt.Errorf("error executing schema query: %w", err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("error committing transaction: %w", err)
	}

	return nil
}
