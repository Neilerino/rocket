package handlers

import (
	"backend/db"
	"backend/db/repository"
	api_utils "backend/internal/api/utils"
	"backend/internal/service"
	"backend/internal/types"

	"encoding/json"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type GroupsHandler struct {
	Db *db.Database
}

type ListGroupsApiArgs struct {
	PlanId int64
}

type CreateGroupApiArgs struct {
	Name        string
	Description string
}

type ListGroupApiArgs struct {
	PlanId     int64 `json:"planId,omitempty"`
	IntervalId int64 `json:"intervalId,omitempty"`
	Id         int64 `json:"id,omitempty"`
	UserId     int64 `json:"userId,omitempty"`
}

// Helper function to convert DB Group to API Group
func dbGroupToApiGroup(dbGroup db.Group) types.Group {
	return types.Group{
		ID:          dbGroup.ID,
		Name:        dbGroup.Name,
		Description: dbGroup.Description,
		UserID:      dbGroup.UserID,
		CreatedAt:   dbGroup.CreatedAt.Time.String(),
		UpdatedAt:   dbGroup.UpdatedAt.Time.String(),
	}
}

// Helper function to convert slice of DB Groups to API Groups
func dbGroupsToApiGroups(dbGroups []db.Group) []types.Group {
	result := make([]types.Group, len(dbGroups))
	for i, dbGroup := range dbGroups {
		result[i] = dbGroupToApiGroup(dbGroup)
	}
	return result
}

func (h *GroupsHandler) List(w http.ResponseWriter, r *http.Request) {
	filterParser := api_utils.NewFilterParser(r, true)

	planId := filterParser.GetIntFilterOrZero("planId")
	intervalId := filterParser.GetIntFilterOrZero("intervalId")
	groupId := filterParser.GetIntFilterOrZero("id")
	userId := filterParser.GetIntFilterOrZero("userId")

	if planId == 0 && groupId == 0 && intervalId == 0 && userId == 0 {
		api_utils.WriteError(w, http.StatusBadRequest, "Missing required field: planId, id, or intervalId")
		return
	}

	limit := filterParser.GetLimit(100)

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		// Create repository directly - no service layer needed
		group_repo := repository.GroupsRepository{Queries: queries}

		log.Printf("Calling repository.ListGroups with planId=%d, groupId=%d, intervalId=%d, limit=%d", planId, groupId, intervalId, limit)

		params := repository.GroupListParams{
			PlanId:     planId,
			GroupId:    groupId,
			IntervalId: intervalId,
			UserId:     userId,
			Limit:      int32(limit),
			Offset:     0,
		}

		dbGroups, err := group_repo.ListGroups(r.Context(), params)
		if err != nil {
			log.Printf("Error from ListGroups: %v", err)
			return err
		}

		// Convert DB groups to API groups
		apiGroups := dbGroupsToApiGroups(dbGroups)

		log.Printf("Successfully retrieved groups, count: %d", len(apiGroups))

		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(apiGroups)
	})

	if success {
		w.WriteHeader(http.StatusOK)
	}
}

func (h *GroupsHandler) Create(w http.ResponseWriter, r *http.Request) {
	var args CreateGroupApiArgs
	if err := json.NewDecoder(r.Body).Decode(&args); err != nil {
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		// Create repository directly - no service layer needed
		group_repo := repository.GroupsRepository{Queries: queries}

		dbGroup, err := group_repo.Create(r.Context(), args.Name, args.Description, 1)
		if err != nil {
			return err
		}

		// Convert DB group to API group
		apiGroup := dbGroupToApiGroup(*dbGroup)

		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(apiGroup)
	})

	if success {
		w.WriteHeader(http.StatusCreated)
	}
}

func (h *GroupsHandler) Update(w http.ResponseWriter, r *http.Request) {
	groupId, err := api_utils.ParseBigInt(chi.URLParam(r, "id"))
	if err != nil {
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid group ID")
		return
	}

	var args CreateGroupApiArgs
	if err := json.NewDecoder(r.Body).Decode(&args); err != nil {
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		// Create repository directly - no service layer needed
		group_repo := repository.GroupsRepository{Queries: queries}

		dbGroup, err := group_repo.Update(r.Context(), groupId, args.Name, args.Description)
		if err != nil {
			return err
		}

		// Convert DB group to API group
		apiGroup := dbGroupToApiGroup(*dbGroup)

		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(apiGroup)
	})

	if success {
		w.WriteHeader(http.StatusOK)
	}
}

func (h *GroupsHandler) Delete(w http.ResponseWriter, r *http.Request) {
	groupId, err := api_utils.ParseBigInt(chi.URLParam(r, "id"))
	if err != nil {
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid group ID")
		return
	}

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		group_repo := repository.GroupsRepository{Queries: queries}
		if _, err := group_repo.Delete(r.Context(), groupId); err != nil {
			return err
		}

		return nil
	})

	if success {
		w.WriteHeader(http.StatusOK)
	}
}

func (h *GroupsHandler) GetById(w http.ResponseWriter, r *http.Request) {
	id, err := api_utils.ParseBigInt(chi.URLParam(r, "id"))
	if err != nil {
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid group ID")
		return
	}

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		// Create repository directly - no service layer needed
		group_repo := repository.GroupsRepository{Queries: queries}

		dbGroup, err := group_repo.GetGroupById(r.Context(), id)
		if err != nil {
			return err
		}

		// Convert DB group to API group
		apiGroup := dbGroupToApiGroup(*dbGroup)

		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(apiGroup)
	})

	if success {
		w.WriteHeader(http.StatusOK)
	}
}

func (h *GroupsHandler) AssignToInterval(w http.ResponseWriter, r *http.Request) {
	groupId, err := api_utils.ParseBigInt(chi.URLParam(r, "groupId"))
	if err != nil {
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid group ID")
		return
	}

	planIntervalId, err := api_utils.ParseBigInt(chi.URLParam(r, "intervalId"))
	if err != nil {
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid plan interval ID")
		return
	}

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		interval_group_assignment_repo := repository.IntervalGroupAssignmentRepository{Queries: queries}
		interval_group_assignment_service := service.NewIntervalGroupAssignmentService(&interval_group_assignment_repo)

		err := interval_group_assignment_service.CreateIntervalGroupAssignment(r.Context(), planIntervalId, groupId)
		if err != nil {
			return err
		}

		return nil
	})

	if success {
		w.WriteHeader(http.StatusOK)
	}
}

func (h *GroupsHandler) RemoveFromInterval(w http.ResponseWriter, r *http.Request) {
	groupId, err := api_utils.ParseBigInt(chi.URLParam(r, "groupId"))
	if err != nil {
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid group ID")
		return
	}

	planIntervalId, err := api_utils.ParseBigInt(chi.URLParam(r, "intervalId"))
	if err != nil {
		api_utils.WriteError(w, http.StatusBadRequest, "Invalid plan interval ID")
		return
	}

	success := api_utils.WithTransaction(r.Context(), h.Db, w, func(queries *db.Queries) error {
		group_interval_assign_repo := repository.IntervalGroupAssignmentRepository{Queries: queries}
		interval_group_assignment_service := service.NewIntervalGroupAssignmentService(&group_interval_assign_repo)

		err := interval_group_assignment_service.DeleteIntervalGroupAssignment(r.Context(), planIntervalId, groupId)
		if err != nil {
			return err
		}

		return nil
	})

	if success {
		w.WriteHeader(http.StatusOK)
	}
}
