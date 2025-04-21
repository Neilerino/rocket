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
  selectedParameters: CreateExerciseParameterTypeDto[];
  allParameterTypes: ParameterType[];
  onParametersChange: (newParameters: CreateExerciseParameterTypeDto[]) => void;
}

const ParameterManager: React.FC<ParameterManagerProps> = ({
  selectedParameters = [],
  allParameterTypes = [],
  onParametersChange,
}) => {
  const handleAddParameter = () => {
    const paramId = parseInt(newParameterId, 10);
    const updatedParameters = [
      ...selectedParameters,
      { parameterTypeId: paramId, locked: false, value: 0 },
    ];
    onParametersChange(updatedParameters);
  };

  const handleToggleLock = (paramId: number) => {
    const updatedParameters = selectedParameters.map((p) =>
      p.parameterTypeId === paramId ? { ...p, locked: !p.locked } : p,
    );
    onParametersChange(updatedParameters);
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-sm mb-2">Manage Parameters</h4>
      <div className="space-y-2 min-h-[50px]">
        {selectedParameters.length > 0 ? (
          selectedParameters.map((param) => {
            const paramId = param.parameterTypeId;

            if (!paramId) {
              console.error('Invalid parameter ID:', param);
              return null;
            }

            return (
              <div
                key={paramId}
                className="flex items-center justify-between p-2 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {param.name} {param.defaultUnit}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleLock(paramId)}
                    className="h-8 w-8 text-gray-500 hover:text-gray-700"
                  >
                    {param.locked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const updatedParameters = selectedParameters.filter(
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
          disabled={allParameterTypes.length === 0}
        >
          <SelectTrigger className="flex-grow">
            <SelectValue placeholder="Select a parameter to add..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Select a parameter...</SelectItem>
            {allParameterTypes.map((pt) => (
              <SelectItem key={pt.id} value={String(pt.id)}>
                {pt.name} {pt.defaultUnit && `(${pt.defaultUnit})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={handleAddParameter}
          disabled={!newParameterId || allParameterTypes.length === 0}
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
