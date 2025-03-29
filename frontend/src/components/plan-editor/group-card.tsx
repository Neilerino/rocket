import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Group, Exercise } from '@/services/types';
import { Card, CardHeader } from '@heroui/card';
import { GroupCardDetails } from './group-card-details';

interface GroupCardProps {
  group: Group;
  onClick: () => void;
  selected?: boolean;
  className?: string;
  allExercises?: Exercise[];
}

const GroupCard: React.FC<GroupCardProps> = ({
  group,
  onClick,
  selected = false,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Card expanded');
    setIsExpanded(!isExpanded);
  };

  return (
    <div onClick={onClick} className={`cursor-pointer ${selected ? 'card-selected' : ''}`}>
      <Card
        className={`
          overflow-hidden transition-all duration-200 border border-gray-200 shadow-sm w-full
          ${selected ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'hover:border-gray-300'}
          ${className}
        `}
      >
        <CardHeader className="p-0">
          <div className="p-4 flex items-center justify-between w-full">
            <div className="flex-1 mr-4">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">{group.name}</h3>
              </div>
            </div>

            <button
              type="button"
              className={`
                p-1 rounded-full hover:bg-gray-100 text-gray-500 ml-auto
                transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-0'}
              `}
              onClick={handleToggle}
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>

        <div
          className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${isExpanded ? 'opacity-100' : 'opacity-0'}
          `}
        >
          {isExpanded && <GroupCardDetails group={group} />}
        </div>
      </Card>
    </div>
  );
};

export default GroupCard;
