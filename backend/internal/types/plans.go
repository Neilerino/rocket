package types

type Plan struct {
	ID          int64          `json:"id"`
	Name        string         `json:"name"`
	Description string         `json:"description,omitempty"`
	UserID      int64          `json:"userId"`
	CreatedAt   string         `json:"createdAt"`
	UpdatedAt   string         `json:"updatedAt"`
	IsTemplate  bool           `json:"isTemplate"`
	IsPublic    bool           `json:"isPublic"`
	Intervals   []PlanInterval `json:"intervals,omitempty"`
}

// Standard API response structure for success
type ApiSuccessResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data"`
	Meta    interface{} `json:"meta,omitempty"`
}

// Standard API response structure for error
type ApiErrorResponse struct {
	Success bool `json:"success"`
	Error   struct {
		Code    string      `json:"code"`
		Message string      `json:"message"`
		Details interface{} `json:"details,omitempty"`
	} `json:"error"`
}

type PlanInterval struct {
	ID          int64  `json:"id"`
	PlanID      int64  `json:"plan_id"`
	Duration    int64  `json:"duration"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Order       int32  `json:"order"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}

type Group struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	UserID      int64  `json:"user_id"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}

type Exercise struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	UserID      int64  `json:"user_id"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}

type ParameterType struct {
	ID          int64   `json:"id"`
	Name        string  `json:"name"`
	DataType    string  `json:"data_type"`
	DefaultUnit string  `json:"default_unit"`
	MinValue    float64 `json:"min_value,omitempty"`
	MaxValue    float64 `json:"max_value,omitempty"`
}

type ExerciseVariation struct {
	ID              int64         `json:"id"`
	Exercise        Exercise      `json:"exercise"`
	ParameterType   ParameterType `json:"parameter_type"`
	ExerciseId      int64         `json:"exercise_id"`
	ParameterTypeId int64         `json:"parameter_type_id"`
}

type IntervalExercisePrescription struct {
	ID                  int64              `json:"id"`
	GroupId             int64              `json:"group_id"`
	ExerciseVariationId int64              `json:"exercise_variation_id"`
	PlanIntervalId      int64              `json:"plan_interval_id"`
	RPE                 float64            `json:"rpe"`
	Sets                int32              `json:"sets"`
	Reps                int32              `json:"reps"`
	Duration            int32              `json:"duration"`
	Rest                int32              `json:"rest"`
	ExerciseVariation   *ExerciseVariation `json:"exercise_variation,omitempty"`
}

type IntervalGroupAssignment struct {
	ID             int64         `json:"id"`
	PlanIntervalId int64         `json:"plan_interval_id"`
	GroupId        int64         `json:"group_id"`
	Frequency      int32         `json:"frequency"`
	Group          *Group        `json:"group,omitempty"`
	PlanInterval   *PlanInterval `json:"plan_interval,omitempty"`
}
