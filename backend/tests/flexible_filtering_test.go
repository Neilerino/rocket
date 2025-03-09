package tests

import (
	"backend/db"
	"backend/internal/types"
	"context"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

// MockPlansRepository is a mock implementation of the plans repository for testing
type MockPlansRepository struct {
	plans []db.Plan
}

// GetPlansByUserId is a mock implementation that filters plans based on the provided filters
func (m *MockPlansRepository) GetPlansByUserId(ctx context.Context, userId int64, limit int, offset int, isTemplate *bool, isPublic *bool) ([]db.Plan, error) {
	// Apply filters
	filtered := make([]db.Plan, 0)
	for _, plan := range m.plans {
		// Filter by user ID
		if plan.UserID != userId {
			continue
		}

		// Filter by isTemplate if provided
		if isTemplate != nil && plan.IsTemplate != *isTemplate {
			continue
		}

		// Filter by isPublic if provided
		if isPublic != nil && plan.IsPublic != *isPublic {
			continue
		}

		filtered = append(filtered, plan)
	}

	// Apply pagination
	start := offset
	end := offset + limit
	if start >= len(filtered) {
		return []db.Plan{}, nil
	}
	if end > len(filtered) {
		end = len(filtered)
	}

	return filtered[start:end], nil
}

// MockPlansService is a mock implementation of the plans service for testing
type MockPlansService struct {
	repo *MockPlansRepository
}

// GetPlanByUserId is a mock implementation that converts db.Plan to types.Plan
func (s *MockPlansService) GetPlanByUserId(ctx context.Context, id int64, limit int, offset int, isTemplate *bool, isPublic *bool) (*[]types.Plan, error) {
	plans, err := s.repo.GetPlansByUserId(ctx, id, limit, offset, isTemplate, isPublic)
	if err != nil {
		return nil, err
	}

	var result []types.Plan
	for _, plan := range plans {
		result = append(result, types.Plan{
			ID:          plan.ID,
			Name:        plan.Name,
			Description: plan.Description,
			UserID:      plan.UserID,
			CreatedAt:   plan.CreatedAt.Time.String(),
			UpdatedAt:   plan.UpdatedAt.Time.String(),
			IsTemplate:  plan.IsTemplate,
			IsPublic:    plan.IsPublic,
		})
	}
	return &result, nil
}

// TestFlexibleFiltering tests the flexible filtering pattern implemented in the plans repository
func TestFlexibleFiltering(t *testing.T) {
	// Create a mock repository with test data
	now := time.Now()
	createdAt := pgtype.Timestamp{Time: now, Valid: true}
	updatedAt := pgtype.Timestamp{Time: now, Valid: true}
	
	mockRepo := &MockPlansRepository{
		plans: []db.Plan{
			{ID: 1, Name: "Plan 1", Description: "Regular plan", UserID: 1, IsTemplate: false, IsPublic: false, CreatedAt: createdAt, UpdatedAt: updatedAt},
			{ID: 2, Name: "Plan 2", Description: "Template plan", UserID: 1, IsTemplate: true, IsPublic: false, CreatedAt: createdAt, UpdatedAt: updatedAt},
			{ID: 3, Name: "Plan 3", Description: "Public plan", UserID: 1, IsTemplate: false, IsPublic: true, CreatedAt: createdAt, UpdatedAt: updatedAt},
			{ID: 4, Name: "Plan 4", Description: "Public template", UserID: 1, IsTemplate: true, IsPublic: true, CreatedAt: createdAt, UpdatedAt: updatedAt},
			{ID: 5, Name: "Plan 5", Description: "Another user's plan", UserID: 2, IsTemplate: false, IsPublic: false, CreatedAt: createdAt, UpdatedAt: updatedAt},
		},
	}
	
	// Create a mock service
	mockService := &MockPlansService{repo: mockRepo}

	// Test user ID
	userID := int64(1)
	limit := 100
	offset := 0

	// Test case 1: No filters (get all plans for user 1)
	t.Run("NoFilters", func(t *testing.T) {
		plans, err := mockService.GetPlanByUserId(context.Background(), userID, limit, offset, nil, nil)
		if err != nil {
			t.Fatalf("Error getting plans with no filters: %v", err)
		}
		if len(*plans) != 4 {
			t.Errorf("Expected 4 plans with no filters, got %d", len(*plans))
		}
		t.Logf("Found %d plans with no filters", len(*plans))
	})

	// Test case 2: Filter by isTemplate=true
	t.Run("FilterByTemplate", func(t *testing.T) {
		isTemplate := true
		plans, err := mockService.GetPlanByUserId(context.Background(), userID, limit, offset, &isTemplate, nil)
		if err != nil {
			t.Fatalf("Error getting template plans: %v", err)
		}
		if len(*plans) != 2 {
			t.Errorf("Expected 2 template plans, got %d", len(*plans))
		}
		
		// Verify all returned plans have isTemplate=true
		for _, plan := range *plans {
			if !plan.IsTemplate {
				t.Errorf("Expected plan %d to have isTemplate=true, but got false", plan.ID)
			}
		}
		t.Logf("Found %d template plans", len(*plans))
	})

	// Test case 3: Filter by isPublic=true
	t.Run("FilterByPublic", func(t *testing.T) {
		isPublic := true
		plans, err := mockService.GetPlanByUserId(context.Background(), userID, limit, offset, nil, &isPublic)
		if err != nil {
			t.Fatalf("Error getting public plans: %v", err)
		}
		if len(*plans) != 2 {
			t.Errorf("Expected 2 public plans, got %d", len(*plans))
		}
		
		// Verify all returned plans have isPublic=true
		for _, plan := range *plans {
			if !plan.IsPublic {
				t.Errorf("Expected plan %d to have isPublic=true, but got false", plan.ID)
			}
		}
		t.Logf("Found %d public plans", len(*plans))
	})

	// Test case 4: Filter by both isTemplate=true and isPublic=true
	t.Run("FilterByTemplateAndPublic", func(t *testing.T) {
		isTemplate := true
		isPublic := true
		plans, err := mockService.GetPlanByUserId(context.Background(), userID, limit, offset, &isTemplate, &isPublic)
		if err != nil {
			t.Fatalf("Error getting public template plans: %v", err)
		}
		if len(*plans) != 1 {
			t.Errorf("Expected 1 public template plan, got %d", len(*plans))
		}
		
		// Verify all returned plans have both isTemplate=true and isPublic=true
		for _, plan := range *plans {
			if !plan.IsTemplate {
				t.Errorf("Expected plan %d to have isTemplate=true, but got false", plan.ID)
			}
			if !plan.IsPublic {
				t.Errorf("Expected plan %d to have isPublic=true, but got false", plan.ID)
			}
		}
		t.Logf("Found %d public template plans", len(*plans))
	})

	// Test case 5: Filter by isTemplate=false
	t.Run("FilterByNonTemplate", func(t *testing.T) {
		isTemplate := false
		plans, err := mockService.GetPlanByUserId(context.Background(), userID, limit, offset, &isTemplate, nil)
		if err != nil {
			t.Fatalf("Error getting non-template plans: %v", err)
		}
		if len(*plans) != 2 {
			t.Errorf("Expected 2 non-template plans, got %d", len(*plans))
		}
		
		// Verify all returned plans have isTemplate=false
		for _, plan := range *plans {
			if plan.IsTemplate {
				t.Errorf("Expected plan %d to have isTemplate=false, but got true", plan.ID)
			}
		}
		t.Logf("Found %d non-template plans", len(*plans))
	})
}
