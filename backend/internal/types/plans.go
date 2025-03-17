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
	PlanID      int64  `json:"planId"`
	Duration    string `json:"duration"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Order       int32  `json:"order"`
	CreatedAt   string `json:"createdAt"`
	UpdatedAt   string `json:"updatedAt"`
	GroupCount  int    `json:"groupCount"`
}

type Group struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	UserID      int64  `json:"userId"`
	CreatedAt   string `json:"createdAt"`
	UpdatedAt   string `json:"updatedAt"`
}

type Exercise struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	UserID      int64  `json:"userId"`
	CreatedAt   string `json:"createdAt"`
	UpdatedAt   string `json:"updatedAt"`
}

type ParameterType struct {
	ID          int64   `json:"id"`
	Name        string  `json:"name"`
	DataType    string  `json:"dataType"`
	DefaultUnit string  `json:"defaultUnit"`
	MinValue    float64 `json:"minValue,omitempty"`
	MaxValue    float64 `json:"maxValue,omitempty"`
}

type ExerciseVariationParam struct {
	ID                  int64         `json:"id"`
	ExerciseVariationId int64         `json:"exerciseVariationId"`
	Locked              bool          `json:"locked"`
	ParameterTypeId     int64         `json:"parameterTypeId"`
	ParameterType       ParameterType `json:"parameterType"`
}

type ExerciseVariation struct {
	ID         int64                    `json:"id"`
	ExerciseId int64                    `json:"exerciseId"`
	Exercise   *Exercise                `json:"exercise,omitempty"`
	Parameters []ExerciseVariationParam `json:"parameters"`
}

type IntervalExercisePrescription struct {
	ID                  int64             `json:"id"`
	GroupId             int64             `json:"group_id"`
	ExerciseVariationId int64             `json:"exercise_variation_id"`
	PlanIntervalId      int64             `json:"plan_interval_id"`
	RPE                 float64           `json:"rpe"`
	Sets                int32             `json:"sets"`
	Reps                int32             `json:"reps"`
	Duration            string            `json:"duration"`
	Rest                string            `json:"rest"`
	ExerciseVariation   ExerciseVariation `json:"exercise_variation,omitempty"`
}

type IntervalGroupAssignment struct {
	ID             int64         `json:"id"`
	PlanIntervalId int64         `json:"plan_interval_id"`
	GroupId        int64         `json:"group_id"`
	Frequency      int32         `json:"frequency"`
	Group          *Group        `json:"group,omitempty"`
	PlanInterval   *PlanInterval `json:"plan_interval,omitempty"`
}
