import { IntervalFilters } from '../../api/intervals';

const QUERY_KEY = 'intervals';

export const createCacheKey = ({
  filters,
  planId,
  intervalId,
}: {
  filters?: IntervalFilters;
  planId?: number | undefined;
  intervalId?: number | undefined;
}) => {
  const finalFilters: IntervalFilters = { ...filters };
  if (planId) {
    finalFilters['planId'] = planId;
  }
  if (intervalId) {
    finalFilters['id'] = intervalId;
  }
  return [QUERY_KEY, finalFilters];
};
