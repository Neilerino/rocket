package repository

import (
	"backend/db"
	"context"

	"github.com/jackc/pgx/v5/pgtype"
)

type ExercisesRepository struct {
	Queries *db.Queries
}

func (r *ExercisesRepository) GetExercisesByUserId(ctx context.Context, userId int64, limit int32) ([]db.Exercise, error) {
	exercises, err := r.Queries.Exercises_GetByUserId(ctx, db.Exercises_GetByUserIdParams{UserID: pgtype.Int8{Int64: userId}, Limit: limit})
	if err != nil {
		return nil, err
	}
	return exercises, nil
}

func (r *ExercisesRepository) GetExerciseById(ctx context.Context, id int64) (*db.Exercise, error) {
	exercise, err := r.Queries.Exercises_GetById(ctx, id)
	if err != nil {
		return nil, err
	}
	return &exercise, nil
}

func (r *ExercisesRepository) CreateExercise(ctx context.Context, name string, description string, userId int64) (*db.Exercise, error) {
	exercise, err := r.Queries.Exercises_CreateOne(ctx, db.Exercises_CreateOneParams{
		Name:        name,
		Description: description,
		UserID:      pgtype.Int8{Int64: userId, Valid: true},
	})
	if err != nil {
		return nil, err
	}
	return &exercise, nil
}

func (r *ExercisesRepository) UpdateExercise(ctx context.Context, id int64, name string, description string) (*db.Exercise, error) {
	exercise, err := r.Queries.Exercises_UpdateOne(ctx, db.Exercises_UpdateOneParams{
		ID:          id,
		Name:        name,
		Description: description,
	})
	if err != nil {
		return nil, err
	}
	return &exercise, nil
}

func (r *ExercisesRepository) DeleteExercise(ctx context.Context, id int64) error {
	return r.Queries.Exercises_DeleteOne(ctx, id)
}
