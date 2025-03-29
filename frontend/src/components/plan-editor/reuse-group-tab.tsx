import { RefObject, useState } from 'react';
import GroupCard from './group-card';
import { Search } from 'lucide-react';
import { Group } from '@/services/types';
import { GroupFilters } from '@/services/api/groups';
import { useGroups } from '@/services/hooks';

import { useAssignGroupToInterval } from '@/services/hooks';

interface ReuseGroupTabProps {
  context: GroupFilters;
  saveCallback: RefObject<(() => Promise<Group>) | null>;
}

const ReuseGroupTab = ({ context, saveCallback }: ReuseGroupTabProps) => {
  const { data: groups } = useGroups({ userId: 1 });

  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { mutateAsync: assignGroupToInterval } = useAssignGroupToInterval(context);

  saveCallback.current = async () => {
    if (selectedGroupId && context.intervalId) {
      await assignGroupToInterval({
        groupId: selectedGroupId,
        intervalId: context.intervalId,
      });
    }
    return groups?.find((g) => g.id === selectedGroupId) as Group;
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500 mb-2">
        Select an existing group to use in this interval. Select an existing group to use in this
        interval.
      </div>

      {/* Search input */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search groups..."
          className="pl-10 block w-full rounded-md border-gray-200 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4 overflow-y-auto pr-1">
        {groups?.length === 0 ? (
          <div className="text-center text-gray-500 py-8 border border-dashed rounded-lg">
            {searchTerm
              ? `No groups found matching "${searchTerm}"`
              : 'No groups available to reuse'}
          </div>
        ) : (
          groups?.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onClick={() => setSelectedGroupId(group.id)}
              selected={selectedGroupId === group.id}
              className="hover:shadow-sm"
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ReuseGroupTab;
