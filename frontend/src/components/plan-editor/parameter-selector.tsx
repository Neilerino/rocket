import React, { useState, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'shad/components/ui/select';
import { Button } from 'shad/components/ui/button';
import { Input } from 'shad/components/ui/input';
import { Label } from 'shad/components/ui/label';
import { ParameterType, CreateExerciseParameterTypeDto } from '@/services/types';
import { RadioGroup, Radio } from '@heroui/radio';
import { PlusCircle } from 'lucide-react';

interface ParameterSelectorProps {
  allParameterTypes: ParameterType[];
  selectedParameterIds: (number | null)[];
  onAddParameter: (parameterToAdd: CreateExerciseParameterTypeDto) => void;
}

type SelectorMode = 'selectExisting' | 'addNew';

const ParameterSelector: React.FC<ParameterSelectorProps> = ({
  allParameterTypes = [],
  selectedParameterIds = [],
  onAddParameter,
}) => {
  const [mode, setMode] = useState<SelectorMode>('selectExisting');
  const [selectedExistingId, setSelectedExistingId] = useState<string>('');
  const [newParamName, setNewParamName] = useState('');
  const [newParamDataType, setNewParamDataType] = useState(''); // Consider making this a Select too
  const [newParamUnit, setNewParamUnit] = useState('');
  const [newParamMin, setNewParamMin] = useState<number | null>(null);
  const [newParamMax, setNewParamMax] = useState<number | null>(null);

  const availableParameterTypes = useMemo(() => {
    return allParameterTypes.filter((pt) => !selectedParameterIds.includes(pt.id));
  }, [allParameterTypes, selectedParameterIds]);

  const handleAddClick = () => {
    if (mode === 'selectExisting' && selectedExistingId) {
      const selectedIdNum = parseInt(selectedExistingId, 10);
      const existingParam = allParameterTypes.find((p) => p.id === selectedIdNum);
      if (existingParam) {
        const parameterToAdd: CreateExerciseParameterTypeDto = {
          parameterTypeId: existingParam.id,
          name: existingParam.name,
          dataType: existingParam.dataType,
          defaultUnit: existingParam.defaultUnit ?? '',
          minValue: existingParam.minValue === undefined ? null : existingParam.minValue,
          maxValue: existingParam.maxValue === undefined ? null : existingParam.maxValue,
          locked: false,
        };
        onAddParameter(parameterToAdd);
        setSelectedExistingId(''); // Reset selection
      }
    } else if (mode === 'addNew') {
      if (!newParamName || !newParamDataType) {
        // Basic validation - ideally use form library or Zod
        console.error('Name and Data Type are required for new parameters.');
        return;
      }
      const parameterToAdd: CreateExerciseParameterTypeDto = {
        parameterTypeId: null,
        name: newParamName,
        dataType: newParamDataType,
        defaultUnit: newParamUnit,
        minValue: newParamMin,
        maxValue: newParamMax,
        locked: false,
      };
      onAddParameter(parameterToAdd);
      setNewParamName('');
      setNewParamDataType('');
      setNewParamUnit('');
      setNewParamMin(null);
      setNewParamMax(null);
    }
  };

  return (
    <div className="space-y-4 rounded-md border p-4">
      <RadioGroup
        defaultValue="selectExisting"
        onValueChange={(value: string) => setMode(value as SelectorMode)}
        className="flex items-center space-x-4"
      >
        <div className="flex items-center space-x-2">
          <Radio value="selectExisting" id="selectExisting" />
          <Label htmlFor="selectExisting" className="cursor-pointer">
            Select Existing
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Radio value="addNew" id="addNew" />
          <Label htmlFor="addNew" className="cursor-pointer">
            Add New
          </Label>
        </div>
      </RadioGroup>

      {mode === 'selectExisting' && (
        <div className="flex items-end gap-2">
          <div className="flex-grow space-y-1.5">
            <Label htmlFor="existing-param-select">Available Parameters</Label>
            <Select
              value={selectedExistingId}
              onValueChange={setSelectedExistingId}
              disabled={availableParameterTypes.length === 0}
            >
              <SelectTrigger id="existing-param-select">
                <SelectValue placeholder="Select a parameter..." />
              </SelectTrigger>
              <SelectContent>
                {availableParameterTypes.map((pt) => (
                  <SelectItem key={pt.id} value={String(pt.id)}>
                    {pt.name} {pt.defaultUnit && `(${pt.defaultUnit})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableParameterTypes.length === 0 && (
              <p className="text-xs text-muted-foreground">No more available parameters.</p>
            )}
          </div>
          <Button
            onClick={handleAddClick}
            disabled={!selectedExistingId || availableParameterTypes.length === 0}
            size="sm"
            variant="outline"
            aria-label="Add selected parameter"
          >
            <PlusCircle className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      )}

      {mode === 'addNew' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-param-name">Name *</Label>
              <Input
                id="new-param-name"
                value={newParamName}
                onChange={(e) => setNewParamName(e.target.value)}
                placeholder="e.g., Weight, Grip Type"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-param-datatype">Data Type *</Label>
              {/* TODO: Replace with Select for constrained types */}
              <Input
                id="new-param-datatype"
                value={newParamDataType}
                onChange={(e) => setNewParamDataType(e.target.value)}
                placeholder="e.g., Number, Text, Enum"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-param-unit">Unit</Label>
              <Input
                id="new-param-unit"
                value={newParamUnit}
                onChange={(e) => setNewParamUnit(e.target.value)}
                placeholder="e.g., kg, lbs, mm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-param-min">Min Value</Label>
              <Input
                id="new-param-min"
                type="number"
                value={newParamMin ?? ''}
                onChange={(e) => setNewParamMin(e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-param-max">Max Value</Label>
              <Input
                id="new-param-max"
                type="number"
                value={newParamMax ?? ''}
                onChange={(e) => setNewParamMax(e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="Optional"
              />
            </div>
          </div>
          <Button
            onClick={handleAddClick}
            disabled={!newParamName || !newParamDataType} // Basic validation
            size="sm"
            variant="outline"
            aria-label="Add new custom parameter"
          >
            <PlusCircle className="h-4 w-4 mr-1" /> Add New Parameter
          </Button>
        </div>
      )}
    </div>
  );
};

export default ParameterSelector;
