package types

type Plan struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	UserID      int64  `json:"user_id"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}


type PlanInterval struct {
	ID       int64  `json:"id"`
	PlanID   int64  `json:"plan_id"`
	Duration string  `json:"duration"`
	Name     string `json:"name"`
	Order    int32  `json:"order"`
}

type Group struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	UserID      int64  `json:"user_id"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}