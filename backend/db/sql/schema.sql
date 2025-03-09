CREATE OR REPLACE FUNCTION validate_length(input_text text, min_length integer, max_length integer)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN char_length(input_text) >= min_length AND char_length(input_text) <= max_length;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL CONSTRAINT users_email_chk CHECK (
        validate_length (email, 1, 255)
    ),
    first_name TEXT NOT NULL CONSTRAINT users_first_name_chk CHECK (
        validate_length (first_name, 1, 255)
    ),
    last_name TEXT NOT NULL CONSTRAINT users_last_name_chk CHECK (
        validate_length (last_name, 1, 255)
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plans (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL CONSTRAINT plans_name_chk CHECK (
        validate_length (name, 1, 255)
    ),
    description TEXT NOT NULL CONSTRAINT plans_description_chk CHECK (
        validate_length (description, 1, 255)
    ),
    user_id BIGINT NOT NULL REFERENCES users (id),
    is_template BOOLEAN NOT NULL DEFAULT FALSE,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plan_intervals (
    id BIGSERIAL PRIMARY KEY,
    plan_id BIGINT NOT NULL REFERENCES plans (id),
    name TEXT CONSTRAINT plan_intervals_name_chk CHECK (
        validate_length (name, 1, 255)
    ),
    duration INTERVAL NOT NULL DEFAULT '1 week',
    "order" INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (plan_id, "order")
);

CREATE TABLE IF NOT EXISTS groups (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL CONSTRAINT groups_name_chk CHECK (
        validate_length (name, 1, 255)
    ),
    description TEXT NOT NULL CONSTRAINT groups_description_chk CHECK (
        validate_length (description, 1, 255)
    ),
    user_id BIGINT NOT NULL REFERENCES users (id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL CONSTRAINT category_name_chk CHECK (
        validate_length (name, 1, 255)
    ),
    icon TEXT NOT NULL CONSTRAINT category_icon_chk CHECK (
        validate_length (icon, 1, 255)
    ),
    user_id BIGINT REFERENCES users (id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exercises (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL CONSTRAINT exercise_name_chk CHECK (
        validate_length (name, 1, 255)
    ),
    description TEXT NOT NULL CONSTRAINT exercise_description_chk CHECK (
        validate_length (description, 1, 10000)
    ),
    user_id BIGINT REFERENCES users (id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE parameter_types (
    id BIGSERIAL PRIMARY KEY,
    "name" TEXT NOT NULL CONSTRAINT parameter_types_name_chk CHECK (validate_length ("name", 1, 255)), -- e.g., "Percentage", "Edge Depth"
    data_type TEXT NOT NULL CONSTRAINT parameter_types_data_type_chk CHECK (validate_length (data_type, 1, 255)), -- "percentage", "length", "time", "weight"
    default_unit TEXT NOT NULL CONSTRAINT parameter_types_default_unit_chk CHECK (validate_length (default_unit, 1, 100)), -- "%", "mm", "seconds", "kg"
    min_value FLOAT, -- e.g., 0 for percentages
    max_value FLOAT -- e.g., 100 for percentages
);

CREATE TABLE exercise_variations (
    id BIGSERIAL PRIMARY KEY,
    exercise_id BIGINT NOT NULL REFERENCES exercises (id),
    parameter_type_id BIGINT REFERENCES parameter_types (id)
);

CREATE TABLE IF NOT EXISTS interval_group_assignments (
    id BIGSERIAL PRIMARY KEY,
    plan_interval_id BIGINT NOT NULL REFERENCES plan_intervals (id),
    group_id BIGINT NOT NULL REFERENCES groups (id),
    frequency INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS interval_exercise_prescriptions (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT NOT NULL REFERENCES groups (id),
    exercise_variation_id BIGINT NOT NULL REFERENCES exercise_variations (id),
    plan_interval_id BIGINT NOT NULL REFERENCES plan_intervals (id),
    rpe INTEGER,
    sets INTEGER NOT NULL,
    reps INTEGER,
    duration INTERVAL,
    rest INTERVAL
);
