import { CardBody } from '@heroui/card';
import React from 'react';
import { Dumbbell, Clock } from 'lucide-react';
import { Group } from '@/services/types';
import { usePrescriptions } from '@/services/hooks';

interface GroupCardDetailsProps {
  group: Group;
}

export const GroupCardDetails: React.FC<GroupCardDetailsProps> = ({ group }) => {
  const { data: groupPrescriptions } = usePrescriptions({ groupId: group.id });

  return (
    <CardBody className="px-4 pb-4 border-t border-gray-100 pt-3 bg-gray-50/50">
      {/* Description */}
      {group.description && <div className="mb-3 text-sm text-gray-600">{group.description}</div>}

      {/* Exercises list */}
      <div className="space-y-2">
        <h4 className="text-xs uppercase tracking-wide text-gray-500 font-medium mb-1">
          Exercises
        </h4>
        {groupPrescriptions && groupPrescriptions?.length > 0 ? (
          <div className="space-y-2">
            {groupPrescriptions.map((prescription, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm p-2 bg-white rounded border border-gray-200"
              >
                <Dumbbell className="w-3.5 h-3.5 text-primary/70" />
                <span className="flex-1">{prescription?.exerciseVariation?.exercise?.name}</span>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {prescription.sets && <span>{prescription.sets} sets</span>}
                  {prescription.rest && (
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-0.5" />
                      {prescription.rest}s
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic">No exercises added yet</div>
        )}
      </div>
    </CardBody>
  );
};
