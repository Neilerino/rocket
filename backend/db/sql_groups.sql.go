// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: sql_groups.sql

package db

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
)

const groups_CreateOne = `-- name: Groups_CreateOne :one
INSERT INTO
    groups (name, description, user_id)
VALUES ($1, $2, $3) RETURNING id, name, description, user_id, created_at, updated_at
`

type Groups_CreateOneParams struct {
	Name        string
	Description string
	UserID      int64
}

func (q *Queries) Groups_CreateOne(ctx context.Context, arg Groups_CreateOneParams) (Group, error) {
	row := q.db.QueryRow(ctx, groups_CreateOne, arg.Name, arg.Description, arg.UserID)
	var i Group
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.UserID,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const groups_DeleteById = `-- name: Groups_DeleteById :one
DELETE FROM groups WHERE id = $1 RETURNING id, name, description, user_id, created_at, updated_at
`

func (q *Queries) Groups_DeleteById(ctx context.Context, id int64) (Group, error) {
	row := q.db.QueryRow(ctx, groups_DeleteById, id)
	var i Group
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.UserID,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const groups_GetById = `-- name: Groups_GetById :one
SELECT id, name, description, user_id, created_at, updated_at FROM groups WHERE id = $1 LIMIT 1
`

func (q *Queries) Groups_GetById(ctx context.Context, id int64) (Group, error) {
	row := q.db.QueryRow(ctx, groups_GetById, id)
	var i Group
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.UserID,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const groups_GetByPlanId = `-- name: Groups_GetByPlanId :many
SELECT g.id, g.name, g.description, g.user_id, g.created_at, g.updated_at, iga.frequency, pi."order" as interval_order
FROM
    "groups" g
    JOIN interval_group_assignments iga on iga.group_id = g.id
    JOIN plan_intervals pi on pi.id = iga.plan_interval_id
    and pi.plan_id = $1
ORDER BY pi."order"
LIMIT $2
`

type Groups_GetByPlanIdParams struct {
	PlanID int64
	Limit  int32
}

type Groups_GetByPlanIdRow struct {
	ID            int64
	Name          string
	Description   string
	UserID        int64
	CreatedAt     pgtype.Timestamp
	UpdatedAt     pgtype.Timestamp
	Frequency     int32
	IntervalOrder int32
}

func (q *Queries) Groups_GetByPlanId(ctx context.Context, arg Groups_GetByPlanIdParams) ([]Groups_GetByPlanIdRow, error) {
	rows, err := q.db.Query(ctx, groups_GetByPlanId, arg.PlanID, arg.Limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Groups_GetByPlanIdRow
	for rows.Next() {
		var i Groups_GetByPlanIdRow
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.Description,
			&i.UserID,
			&i.CreatedAt,
			&i.UpdatedAt,
			&i.Frequency,
			&i.IntervalOrder,
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

const groups_GetByUserId = `-- name: Groups_GetByUserId :many
SELECT id, name, description, user_id, created_at, updated_at FROM groups WHERE user_id = $1 ORDER BY created_at LIMIT $2
`

type Groups_GetByUserIdParams struct {
	UserID int64
	Limit  int32
}

func (q *Queries) Groups_GetByUserId(ctx context.Context, arg Groups_GetByUserIdParams) ([]Group, error) {
	rows, err := q.db.Query(ctx, groups_GetByUserId, arg.UserID, arg.Limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Group
	for rows.Next() {
		var i Group
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.Description,
			&i.UserID,
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

const groups_List = `-- name: Groups_List :many
SELECT groups.id, groups.name, groups.description, groups.user_id, groups.created_at, groups.updated_at from groups 
JOIN interval_group_assignments on groups.id = interval_group_assignments.group_id
JOIN plan_intervals on interval_group_assignments.plan_interval_id = plan_intervals.id 
WHERE 
    (groups.id = $1::BIGINT or $1::bigint = 0) 
    AND (groups.user_id = $2::BIGINT or $2::bigint = 0)
    AND (plan_intervals.plan_id = $3::BIGINT or $3::bigint = 0)
    AND (interval_group_assignments.plan_interval_id = $4::BIGINT or $4::bigint = 0)
ORDER BY groups.created_at DESC
LIMIT $6::int
OFFSET $5::int
`

type Groups_ListParams struct {
	GroupID    int64
	UserID     int64
	PlanID     int64
	IntervalID int64
	Offset     int32
	Limit      int32
}

func (q *Queries) Groups_List(ctx context.Context, arg Groups_ListParams) ([]Group, error) {
	rows, err := q.db.Query(ctx, groups_List,
		arg.GroupID,
		arg.UserID,
		arg.PlanID,
		arg.IntervalID,
		arg.Offset,
		arg.Limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Group
	for rows.Next() {
		var i Group
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.Description,
			&i.UserID,
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

const groups_UpdateOne = `-- name: Groups_UpdateOne :one
UPDATE "groups"
SET
    name = $1,
    description = $2
WHERE
    id = $3 RETURNING id, name, description, user_id, created_at, updated_at
`

type Groups_UpdateOneParams struct {
	Name        string
	Description string
	ID          int64
}

func (q *Queries) Groups_UpdateOne(ctx context.Context, arg Groups_UpdateOneParams) (Group, error) {
	row := q.db.QueryRow(ctx, groups_UpdateOne, arg.Name, arg.Description, arg.ID)
	var i Group
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.UserID,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}
