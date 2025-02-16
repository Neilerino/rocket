import { useState } from 'react';
import { ChevronDown, ChevronRight, Dumbbell, Plus, Copy } from 'lucide-react';
import { Button } from 'shad/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'shad/components/ui/dropdown-menu';
import { Group, Interval } from './types';

interface IntervalEditorProps {
  interval: Interval;
  allGroups: Group[];
  isExpanded: boolean;
  onToggle: () => void;
  onSelectGroup: (group: Group) => void;
}

const IntervalEditor = ({
  interval,
  allGroups,
  isExpanded,
  onToggle,
  onSelectGroup,
}: IntervalEditorProps) => {
  // Get groups that aren't already in this interval
  const availableGroups = allGroups.filter(
    (group) => !interval.groups.some((g) => g.id === group.id),
  );

  return (
    <div className="border rounded-lg bg-white">
      {/* Interval Header */}
      <div className="flex items-center px-6 py-4 cursor-pointer border-b" onClick={onToggle}>
        <div className="w-5 h-5 mr-2 text-gray-500">
          {isExpanded ? <ChevronDown /> : <ChevronRight />}
        </div>
        <h2 className="text-lg font-medium">{interval.name}</h2>
      </div>

      {/* Interval Content */}
      {isExpanded && (
        <div className="p-6 pt-4">
          <div className="grid grid-cols-2 gap-6">
            {interval.groups.map((group) => (
              <div
                key={group.id}
                className="border rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer"
                onClick={() => onSelectGroup(group)}
              >
                {/* Group Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium">{group.name}</h3>
                    <p className="text-sm text-gray-500">{group.frequency}</p>
                  </div>
                </div>

                {/* Group Exercises Preview */}
                <div className="space-y-2">
                  {group.exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2 text-gray-400">
                          <Dumbbell />
                        </div>
                        <span className="font-medium">{exercise.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{exercise.sets} sets</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Add Group Cards */}
            <div className="space-y-3">
              {/* Create New Group Card */}
              <div
                className="border-dotted border-2 rounded-lg p-4 flex items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer h-[96px]"
                onClick={() => onSelectGroup({ id: 'new', name: '', frequency: '', exercises: [] })}
              >
                <div className="text-center">
                  <div className="w-6 h-6 mx-auto mb-2 text-gray-400">
                    <Plus />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Create New Group</span>
                </div>
              </div>

              {/* Reuse Group Card */}
              <div
                className="border-dotted border-2 rounded-lg p-4 flex items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer h-[96px]"
                onClick={() => {
                  if (availableGroups.length > 0) {
                    onSelectGroup(availableGroups[0]);
                  }
                }}
              >
                <div className="text-center">
                  <div className="w-6 h-6 mx-auto mb-2 text-gray-400">
                    <Copy />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Reuse Existing Group</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntervalEditor;
