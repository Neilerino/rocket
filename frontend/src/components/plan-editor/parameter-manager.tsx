import React, { useState } from 'react';
import { Button } from '@heroui/button';

import { ParameterType, CreateExerciseParameterTypeDto } from '@/services/types';
import { Lock, Unlock, Trash2 } from 'lucide-react';
import ParameterCombobox from './parameter-combobox';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/modal';
import ParameterForm from '../parameters/parameter-form';
import { ExerciseParameterFormData } from '../parameters/useParameterForm';

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
  const [isAddParamDialogOpen, setIsAddParamDialogOpen] = useState(false);

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

  const handleAddNewParamSubmit = (formData: ExerciseParameterFormData) => {
    const parameterToAdd: CreateExerciseParameterTypeDto = {
      ...formData,
      parameterTypeId: null,
      locked: false,
    };
    handleParameterAdd(parameterToAdd);
    setIsAddParamDialogOpen(false);
  };

  const handleToggleLock = (param: CreateExerciseParameterTypeDto) => {
    const updatedParameters = selectedParameters.map((p) =>
      p === param ? { ...p, locked: !p.locked } : p,
    );
    onParametersChange(updatedParameters);
  };

  const handleDeleteParameter = (paramToDelete: CreateExerciseParameterTypeDto) => {
    const updatedParameters = selectedParameters.filter((p) =>
      p === paramToDelete ? false : true,
    );
    onParametersChange(updatedParameters);
  };

  const gridTemplateRows = `repeat(${selectedParameters.length}, minmax(0, auto))`;

  return (
    <div className="space-y-2">
      <ParameterCombobox
        allParameterTypes={allParameterTypes}
        selectedParameterIds={selectedParameters.map((p) => p.parameterTypeId)}
        onSelectExisting={handleSelectExistingParam}
        onTriggerAddNew={() => setIsAddParamDialogOpen(true)}
      />

      <Modal isOpen={isAddParamDialogOpen} onOpenChange={setIsAddParamDialogOpen}>
        <ModalContent className="sm:max-w-[425px]">
          <ModalHeader>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Add New Parameter</h2>
              <p className="text-sm text-gray-500">
                Define a new parameter type. This will be available for future use.
              </p>
            </div>
          </ModalHeader>
          <ModalBody>
            <ParameterForm
              onSubmit={handleAddNewParamSubmit}
              onCancel={() => setIsAddParamDialogOpen(false)}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
      <div className="grid gap-2 transition-all duration-300 ease-out" style={{ gridTemplateRows }}>
        {selectedParameters.length > 0 ? (
          selectedParameters.map((param) => (
            <div
              key={param.parameterTypeId ?? `new-${param.name}`}
              className={`flex items-center justify-between p-2 border rounded-md bg-gray-50 dark:bg-gray-800`}
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {param.name} {param.defaultUnit && `(${param.defaultUnit})`}
                {param.parameterTypeId === null && (
                  <span className="text-xs text-blue-500 ml-1">(New)</span>
                )}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => handleToggleLock(param)}
                  className="h-8 w-8 text-gray-500 hover:text-gray-700"
                  disabled={param.parameterTypeId === null}
                >
                  {param.locked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => handleDeleteParameter(param)}
                  className="h-8 w-8 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 italic text-center py-2">No parameters added.</p>
        )}
      </div>
    </div>
  );
};

export default ParameterManager;
