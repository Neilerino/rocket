import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'shad/components/ui/button';
import { ParameterType, CreateExerciseParameterTypeDto } from '@/services/types';
import { Lock, Unlock, Trash2 } from 'lucide-react';
import ParameterCombobox from './parameter-combobox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from 'shad/components/ui/dialog';
import ParameterForm, { ParameterFormData } from '../parameters/parameter-form';

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
  const [newlyAddedParams, setNewlyAddedParams] = useState<Set<number | null>>(new Set());
  const [removingParams, setRemovingParams] = useState<Set<number | null>>(new Set());
  const [isAddParamDialogOpen, setIsAddParamDialogOpen] = useState(false);
  const prevParamsRef = useRef<CreateExerciseParameterTypeDto[]>(selectedParameters);

  useEffect(() => {
    const currentParamIds = new Set(
      selectedParameters.map((p) => p.parameterTypeId).filter((id) => id !== null),
    );
    const prevParamIds = new Set(
      prevParamsRef.current.map((p) => p.parameterTypeId).filter((id) => id !== null),
    );

    const added = new Set([...currentParamIds].filter((id) => !prevParamIds.has(id)));
    if (added.size > 0) {
      setNewlyAddedParams(added);
      const timer = setTimeout(() => {
        setNewlyAddedParams(new Set());
      }, 500);
      return () => clearTimeout(timer);
    }

    prevParamsRef.current = selectedParameters;
  }, [selectedParameters]);

  const handleParameterAdd = (parameterToAdd: CreateExerciseParameterTypeDto) => {
    if (
      parameterToAdd.parameterTypeId !== null &&
      selectedParameters.some((p) => p.parameterTypeId === parameterToAdd.parameterTypeId)
    ) {
      console.warn('Attempted to add duplicate existing parameter.');
      return;
    }

    const updatedParameters = [...selectedParameters, parameterToAdd];
    onParametersChange(updatedParameters);
  };

  const handleSelectExistingParam = (parameter: ParameterType) => {
    const parameterToAdd: CreateExerciseParameterTypeDto = {
      parameterTypeId: parameter.id,
      name: parameter.name,
      dataType: parameter.dataType,
      defaultUnit: parameter.defaultUnit ?? '',
      minValue: parameter.minValue === undefined ? null : parameter.minValue,
      maxValue: parameter.maxValue === undefined ? null : parameter.maxValue,
      locked: false,
    };
    handleParameterAdd(parameterToAdd);
  };

  const handleAddNewParamSubmit = (formData: ParameterFormData) => {
    const parameterToAdd: CreateExerciseParameterTypeDto = {
      ...formData,
      parameterTypeId: null,
      locked: false,
    };
    handleParameterAdd(parameterToAdd);
    setIsAddParamDialogOpen(false);
  };

  const handleToggleLock = (paramId: number | null) => {
    if (paramId === null) return;
    const updatedParameters = selectedParameters.map((p) =>
      p.parameterTypeId === paramId ? { ...p, locked: !p.locked } : p,
    );
    onParametersChange(updatedParameters);
  };

  const handleDeleteParameter = (paramId: number | null) => {
    setRemovingParams((prev) => new Set(prev).add(paramId));
    setTimeout(() => {
      const updatedParameters = selectedParameters.filter((p) => p.parameterTypeId !== paramId);
      onParametersChange(updatedParameters);
      setRemovingParams((prev) => {
        const next = new Set(prev);
        next.delete(paramId);
        return next;
      });
    }, 300);
  };

  const gridTemplateRows = `repeat(${selectedParameters.length}, minmax(0, auto))`;

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-sm mb-2">Manage Parameters</h4>
      <div className="grid gap-2 transition-all duration-300 ease-out" style={{ gridTemplateRows }}>
        {selectedParameters.length > 0 ? (
          selectedParameters.map((param) => {
            const paramId = param.parameterTypeId;
            const isRemoving = removingParams.has(paramId);
            const isNewlyAdded = newlyAddedParams.has(paramId);

            let animationClass = '';
            if (isNewlyAdded) animationClass = 'animate-fade-in-down';
            if (isRemoving) animationClass = 'animate-fade-out-up';

            return (
              <div
                key={paramId ?? `new-${param.name}-${Math.random()}`}
                className={`flex items-center justify-between p-2 border rounded-md bg-gray-50 dark:bg-gray-800 ${animationClass}`}
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {param.name} {param.defaultUnit && `(${param.defaultUnit})`}
                  {paramId === null && <span className="text-xs text-blue-500 ml-1">(New)</span>}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleLock(paramId)}
                    className="h-8 w-8 text-gray-500 hover:text-gray-700"
                    disabled={paramId === null || isRemoving}
                  >
                    {param.locked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteParameter(paramId)}
                    className="h-8 w-8 text-red-500 hover:text-red-700"
                    disabled={isRemoving}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 px-2">No parameters added yet.</p>
        )}
      </div>

      <ParameterCombobox
        allParameterTypes={allParameterTypes}
        selectedParameterIds={selectedParameters.map((p) => p.parameterTypeId)}
        onSelectExisting={handleSelectExistingParam}
        onTriggerAddNew={() => setIsAddParamDialogOpen(true)}
      />

      {isAddParamDialogOpen && (
        <Dialog defaultOpen={true}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Parameter</DialogTitle>
              <DialogDescription>
                Define a new parameter type. This will be available for future use.
              </DialogDescription>
            </DialogHeader>
            <ParameterForm
              onSubmit={handleAddNewParamSubmit}
              onCancel={() => setIsAddParamDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ParameterManager;
