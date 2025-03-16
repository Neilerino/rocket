// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: sql_plans.sql

package db

import (
	"context"
)

const plans_CreateOne = `-- name: Plans_CreateOne :one
INSERT INTO
    plans (
        name,
        description,
        user_id,
        is_template,
        is_public
    )
VALUES ($1, $2, $3, $4, $5) RETURNING id, name, description, user_id, is_template, is_public, created_at, updated_at
`

type Plans_CreateOneParams struct {
	Name        string
	Description string
	UserID      int64
	IsTemplate  bool
	IsPublic    bool
}

func (q *Queries) Plans_CreateOne(ctx context.Context, arg Plans_CreateOneParams) (Plan, error) {
	row := q.db.QueryRow(ctx, plans_CreateOne,
		arg.Name,
		arg.Description,
		arg.UserID,
		arg.IsTemplate,
		arg.IsPublic,
	)
	var i Plan
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.UserID,
		&i.IsTemplate,
		&i.IsPublic,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const plans_DeleteById = `-- name: Plans_DeleteById :one
DELETE FROM plans WHERE id = $1 RETURNING id, name, description, user_id, is_template, is_public, created_at, updated_at
`

func (q *Queries) Plans_DeleteById(ctx context.Context, id int64) (Plan, error) {
	row := q.db.QueryRow(ctx, plans_DeleteById, id)
	var i Plan
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.UserID,
		&i.IsTemplate,
		&i.IsPublic,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const plans_GetByPlanId = `-- name: Plans_GetByPlanId :one
SELECT id, name, description, user_id, is_template, is_public, created_at, updated_at FROM plans WHERE id = $1 LIMIT 1
`

func (q *Queries) Plans_GetByPlanId(ctx context.Context, id int64) (Plan, error) {
	row := q.db.QueryRow(ctx, plans_GetByPlanId, id)
	var i Plan
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.UserID,
		&i.IsTemplate,
		&i.IsPublic,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const plans_GetByUserId = `-- name: Plans_GetByUserId :many
SELECT id, name, description, user_id, is_template, is_public, created_at, updated_at
FROM plans
WHERE
    user_id = $1
    AND (
        is_template = $2
        OR $3 = false
    )
    AND (
        is_public = $4
        OR $5 = false
    )
ORDER BY updated_at DESC
LIMIT $6
OFFSET
    $7
`

type Plans_GetByUserIdParams struct {
	UserID     int64
	IsTemplate bool
	Column3    interface{}
	IsPublic   bool
	Column5    interface{}
	Limit      int32
	Offset     int32
}

func (q *Queries) Plans_GetByUserId(ctx context.Context, arg Plans_GetByUserIdParams) ([]Plan, error) {
	rows, err := q.db.Query(ctx, plans_GetByUserId,
		arg.UserID,
		arg.IsTemplate,
		arg.Column3,
		arg.IsPublic,
		arg.Column5,
		arg.Limit,
		arg.Offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Plan
	for rows.Next() {
		var i Plan
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.Description,
			&i.UserID,
			&i.IsTemplate,
			&i.IsPublic,
			&i.CreatedAt,
			&i.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const plans_UpdateOne = `-- name: Plans_UpdateOne :one
UPDATE plans
SET
    name = $1,
    description = $2,
    is_template = $3,
    is_public = $4,
    updated_at = CURRENT_TIMESTAMP
WHERE
    id = $5 RETURNING id, name, description, user_id, is_template, is_public, created_at, updated_at
`

type Plans_UpdateOneParams struct {
	Name        string
	Description string
	IsTemplate  bool
	IsPublic    bool
	ID          int64
}

func (q *Queries) Plans_UpdateOne(ctx context.Context, arg Plans_UpdateOneParams) (Plan, error) {
	row := q.db.QueryRow(ctx, plans_UpdateOne,
		arg.Name,
		arg.Description,
		arg.IsTemplate,
		arg.IsPublic,
		arg.ID,
	)
	var i Plan
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.UserID,
		&i.IsTemplate,
		&i.IsPublic,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}
