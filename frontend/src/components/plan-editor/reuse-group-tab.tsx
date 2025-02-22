import { Group } from './types';

interface ReuseGroupTabProps {
  availableGroups: Group[];
  onSelectGroup: (group: Group) => void;
}

const ReuseGroupTab = ({ availableGroups, onSelectGroup }: ReuseGroupTabProps) => {
  return (
    <div className="space-y-3">
      {availableGroups.length > 0 ? (
        availableGroups.map((existingGroup) => (
          <div
            key={existingGroup.id}
            className="border rounded-lg p-3 hover:border-gray-300 transition-colors cursor-pointer"
            onClick={() => onSelectGroup(existingGroup)}
          >
            <div className="font-medium">{existingGroup.name}</div>
            <div className="text-sm text-muted-foreground">{existingGroup.frequency}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {existingGroup.exercises.length} exercise{existingGroup.exercises.length !== 1 ? 's' : ''}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-muted-foreground py-4">
          No groups available to reuse
        </div>
      )}
    </div>
  );
};

export default ReuseGroupTab;
