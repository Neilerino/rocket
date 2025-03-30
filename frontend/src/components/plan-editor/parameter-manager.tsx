import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'shad/components/ui/select';
import { Button } from 'shad/components/ui/button';
import { ParameterType, CreateExerciseParameterTypeDto } from '@/services/types';
import { Lock, Unlock, Trash2, PlusCircle } from 'lucide-react';

interface ParameterManagerProps {
  parameters: CreateExerciseParameterTypeDto[];
  allParameterTypes: ParameterType[];
  onParametersChange: (newParameters: CreateExerciseParameterTypeDto[]) => void;
}

const ParameterManager: React.FC<ParameterManagerProps> = ({
  parameters = [],
  allParameterTypes = [],
  onParametersChange,
}) => {
  const [newParameterId, setNewParameterId] = useState<string>('');

  const availableParameterTypes = allParameterTypes.filter(
    (pt) => !parameters.some((p) => p.parameterTypeId === pt.id),
  );

  const handleAddParameter = () => {
    if (newParameterId) {
      const paramId = parseInt(newParameterId, 10);
      const updatedParameters = [
        ...parameters,
        { parameterTypeId: paramId, locked: false, value: 0 },
      ];
      onParametersChange(updatedParameters);
    }
  };

  const handleToggleLock = (paramId: number) => {
    const updatedParameters = parameters.map((p) =>
      p.parameterTypeId === paramId ? { ...p, locked: !p.locked } : p,
    );
    onParametersChange(updatedParameters);
  };

  const getParameterName = (paramId: number): string => {
    return allParameterTypes.find((pt) => pt.id === paramId)?.name || 'Unknown';
  };

  const getParameterUnit = (paramId: number): string => {
    return allParameterTypes.find((pt) => pt.id === paramId)?.defaultUnit || '';
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-sm mb-2">Manage Parameters</h4>
      <div className="space-y-2 min-h-[50px]">
        {parameters.length > 0 ? (
          parameters.map((param) => {
            const paramId = param.parameterTypeId;

            if (!paramId) {
              console.error('Invalid parameter ID:', param);
              return null;
            }

            const isLocked = param.locked;
            const name = getParameterName(paramId);
            const unit = getParameterUnit(paramId);

            return (
              <div
                key={paramId}
                className="flex items-center justify-between p-2 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {name} {unit && `(${unit})`}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleLock(paramId)}
                    className="h-8 w-8 text-gray-500 hover:text-gray-700"
                  >
                    {isLocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const updatedParameters = parameters.filter(
                        (p) => p.parameterTypeId !== paramId,
                      );
                      onParametersChange(updatedParameters);
                    }}
                    className="h-8 w-8 text-gray-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-500 italic text-center py-2">No parameters added yet.</p>
        )}
      </div>

      <div className="flex items-center gap-2 pt-2 border-t dark:border-gray-700">
        <Select
          value={newParameterId}
          onValueChange={setNewParameterId}
          disabled={availableParameterTypes.length === 0}
        >
          <SelectTrigger className="flex-grow">
            <SelectValue placeholder="Select a parameter to add..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Select a parameter...</SelectItem>
            {availableParameterTypes.map((pt) => (
              <SelectItem key={pt.id} value={String(pt.id)}>
                {pt.name} {pt.defaultUnit ? `(${pt.defaultUnit})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={handleAddParameter}
          disabled={!newParameterId || availableParameterTypes.length === 0}
          size="sm"
          variant="outline"
        >
          Add Parameter
          <PlusCircle className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ParameterManager;
