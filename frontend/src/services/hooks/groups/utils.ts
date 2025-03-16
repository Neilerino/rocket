import { GroupFilters } from '@/services/api';

export const QUERY_KEY = 'groups';

export const createGroupCacheKey = (args: { filters: GroupFilters }) => [QUERY_KEY, args.filters];
