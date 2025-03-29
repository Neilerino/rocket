package service

func DerefOrDefault[T any](p *T, defaultValue T) T {
	if p == nil {
		return defaultValue
	}
	return *p
}
