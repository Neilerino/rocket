import { useState } from 'react';
import { Exercise } from './types';
import GroupCard from './group-card';
import { Button } from 'shad/components/ui/button';
import { Search } from 'lucide-react';
import { Group } from '@/services/types';

interface ReuseGroupTabProps {
  availableGroups: Group[];
  onSelectGroup: (group: Group) => void;
  allExercises?: Exercise[];
}

const ReuseGroupTab = ({
  availableGroups,
  onSelectGroup,
  allExercises = [],
}: ReuseGroupTabProps) => {
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter groups based on search term
  const filteredGroups = availableGroups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  console.log('selected group id: ', selectedGroupId);

  // Handle group selection
  const handleGroupClick = (group: Group) => {
    console.log('handleGroupClick - called', group);
    setSelectedGroupId(group.id);
  };

  // Handle use group button click
  const handleUseGroup = () => {
    if (!selectedGroupId) return;

    const group = availableGroups.find((g) => g.id === selectedGroupId);
    if (!group) return;

    onSelectGroup(group);
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500 mb-2">
        Select an existing group to use in this interval.
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
        {filteredGroups.length === 0 ? (
          <div className="text-center text-gray-500 py-8 border border-dashed rounded-lg">
            {searchTerm
              ? `No groups found matching "${searchTerm}"`
              : 'No groups available to reuse'}
          </div>
        ) : (
          filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onClick={() => setSelectedGroupId(group.id)}
              selected={selectedGroupId === group.id}
              className="hover:shadow-sm"
              allExercises={allExercises}
            />
          ))
        )}
      </div>

      <div className="pt-4 flex justify-end">
        <Button onClick={handleUseGroup} disabled={!selectedGroupId} className="w-full sm:w-auto">
          Use Selected Group
        </Button>
      </div>
    </div>
  );
};

export default ReuseGroupTab;
