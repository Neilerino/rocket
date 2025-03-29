import React, { useState, useEffect, useRef } from 'react';
import { ParameterType } from '@/services/types';
import { Input } from 'shad/components/ui/input';
import { Button } from 'shad/components/ui/button';
import { Select, SelectItem } from '@heroui/select';
import { Info, Trash2, ArrowUpDown } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'shad/components/ui/tooltip';

interface ParameterManagerProps {
  parameterTypes: ParameterType[];
  parameters: Record<string, number>;
  lockedParameters?: Record<string, number>;
  onChange: (parameters: Record<string, number>, lockedParameters: Record<string, number>) => void;
}

const ParameterManager: React.FC<ParameterManagerProps> = ({
  parameterTypes,
  parameters = {},
  lockedParameters = {},
  onChange,
}) => {
  // Track newly added parameter IDs for animation
  const [newParams, setNewParams] = useState<Record<string, boolean>>({});

  // Track parameters being removed for fade-out animation
  const [removingParams, setRemovingParams] = useState<Record<string, boolean>>({});

  // Track container heights for animation
  const lockedContainerRef = useRef<HTMLDivElement>(null);
  const variableContainerRef = useRef<HTMLDivElement>(null);

  // Track the previous parameters to detect additions and removals
  const prevParamsRef = useRef<{
    params: Record<string, number>;
    lockedParams: Record<string, number>;
  }>({ params: {}, lockedParams: {} });

  // Detect when parameters are added to trigger animations
  useEffect(() => {
    const prevParams = prevParamsRef.current;

    // Find new parameters that weren't in the previous state
    const newParamIds: Record<string, boolean> = {};

    // Check for new variable parameters
    Object.keys(parameters).forEach((paramId) => {
      if (!prevParams.params[paramId]) {
        newParamIds[paramId] = true;
      }
    });

    // Check for new locked parameters
    Object.keys(lockedParameters).forEach((paramId) => {
      if (!prevParams.lockedParams[paramId]) {
        newParamIds[`locked-${paramId}`] = true;
      }
    });

    // If we found new parameters, update state and clear after animation
    if (Object.keys(newParamIds).length > 0) {
      setNewParams(newParamIds);

      // Clear animation flags after animation completes
      const animationTimeout = setTimeout(() => {
        setNewParams({});
      }, 500); // Match this with the animation duration

      return () => clearTimeout(animationTimeout);
    }

    // Update the reference for next comparison
    prevParamsRef.current = {
      params: { ...parameters },
      lockedParams: { ...lockedParameters },
    };
  }, [parameters, lockedParameters]);

  // Handle parameter value change
  const handleValueChange = (paramId: string, value: string, isLocked: boolean) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    if (isLocked) {
      // Update locked parameters
      const updatedLockedParams = {
        ...lockedParameters,
        [paramId]: numValue,
      };

      // Remove from regular parameters if it exists there
      const updatedParams = { ...parameters };
      delete updatedParams[paramId];

      onChange(updatedParams, updatedLockedParams);
    } else {
      // Update regular parameters
      const updatedParams = {
        ...parameters,
        [paramId]: numValue,
      };

      // Remove from locked parameters if it exists there
      const updatedLockedParams = { ...lockedParameters };
      delete updatedLockedParams[paramId];

      onChange(updatedParams, updatedLockedParams);
    }
  };

  // Move parameter between locked and variable sections
  const moveParameter = (paramId: string, targetIsLocked: boolean) => {
    if (targetIsLocked) {
      // Move from variable to locked
      const value = parameters[paramId];
      const updatedLockedParams = { ...lockedParameters, [paramId]: value };
      const updatedParams = { ...parameters };
      delete updatedParams[paramId];

      onChange(updatedParams, updatedLockedParams);
    } else {
      // Move from locked to variable
      const value = lockedParameters[paramId];
      const updatedParams = { ...parameters, [paramId]: value };
      const updatedLockedParams = { ...lockedParameters };
      delete updatedLockedParams[paramId];

      onChange(updatedParams, updatedLockedParams);
    }
  };

  // Remove a parameter
  const removeParameter = (paramId: string, isLocked: boolean) => {
    // First mark this parameter as being removed (for animation)
    const paramKey = isLocked ? `locked-${paramId}` : paramId;
    setRemovingParams((prev) => ({ ...prev, [paramKey]: true }));

    // Wait for animation to complete before actually removing
    setTimeout(() => {
      if (isLocked) {
        const updatedLockedParams = { ...lockedParameters };
        delete updatedLockedParams[paramId];
        onChange(parameters, updatedLockedParams);
      } else {
        const updatedParams = { ...parameters };
        delete updatedParams[paramId];
        onChange(updatedParams, lockedParameters);
      }

      // Clear the removing state for this parameter
      setRemovingParams((prev) => {
        const updated = { ...prev };
        delete updated[paramKey];
        return updated;
      });
    }, 300); // Slightly shorter than animation duration for smoother transition
  };

  // Add a new parameter directly from selection
  const handleParameterSelection = (selectedParamId: string, isConstant: boolean) => {
    if (!selectedParamId) return;

    if (isConstant) {
      // Add to locked parameters
      const updatedLockedParams = {
        ...lockedParameters,
        [selectedParamId]: 0,
      };

      onChange(parameters, updatedLockedParams);
    } else {
      // Add to regular parameters
      const updatedParams = {
        ...parameters,
        [selectedParamId]: 0,
      };

      onChange(updatedParams, lockedParameters);
    }
  };

  // Get available parameter types (those not already used)
  const getAvailableParameterTypes = () => {
    const usedParamIds = [...Object.keys(parameters), ...Object.keys(lockedParameters)];

    return parameterTypes.filter((param) => !usedParamIds.includes(param.id));
  };

  // Get parameter name from ID
  const getParameterName = (paramId: string) => {
    const paramType = parameterTypes.find((pt) => pt.id === paramId);
    return paramType?.name || 'Unknown Parameter';
  };

  // Get parameter unit from ID
  const getParameterUnit = (paramId: string) => {
    const paramType = parameterTypes.find((pt) => pt.id === paramId);
    return paramType?.defaultUnit || '';
  };

  const availableParameterTypes = getAvailableParameterTypes();

  return (
    <div className="space-y-6">
      {/* Constant/Locked Parameters Section */}
      <div className="space-y-4">
        <div className="flex items-center">
          <h3 className="text-base font-medium text-gray-900">Constant Parameters</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="ml-2 cursor-help">
                  <Info className="h-4 w-4 text-gray-400" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">
                  Constant parameters remain fixed between workouts. For example, edge size in
                  hangboarding would typically be locked, while added weight might vary.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Add Parameter Selector */}
        {availableParameterTypes.length > 0 && (
          <div className="w-full">
            <Select
              label="Add constant parameter"
              placeholder="Select a parameter to add"
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                if (selected) {
                  handleParameterSelection(selected, true);
                }
              }}
            >
              {availableParameterTypes.map((param) => (
                <SelectItem key={param.id} value={param.id}>
                  <div className="flex items-center">
                    <span>{param.name}</span>
                    {param.defaultUnit && (
                      <span className="ml-1 text-gray-500">({param.defaultUnit})</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </Select>
          </div>
        )}

        {/* Locked Parameters List */}
        <div
          ref={lockedContainerRef}
          className="mt-2 grid grid-rows-[auto] transition-all duration-300 ease-in-out"
          style={{
            gridTemplateRows:
              Object.keys(lockedParameters).length === 0
                ? '1fr'
                : `repeat(${Object.keys(lockedParameters).length}, auto)`,
            gap: '0.5rem',
          }}
        >
          {Object.entries(lockedParameters).length > 0 ? (
            Object.entries(lockedParameters).map(([paramId, value]) => {
              const paramKey = `locked-${paramId}`;
              const isRemoving = removingParams[paramKey];
              const isNew = newParams[paramKey];

              return (
                <div
                  key={paramKey}
                  className={`flex items-center gap-2 bg-gray-50 p-3 rounded-md border transition-all duration-300 ${
                    isRemoving ? 'animate-fade-out-up' : isNew ? 'animate-fade-in-down' : ''
                  }`}
                >
                  <div className="flex-1 flex items-center">
                    <Lock className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      {getParameterName(paramId)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Input
                      type="number"
                      value={value}
                      onChange={(e) => handleValueChange(paramId, e.target.value, true)}
                      className="w-20 text-right"
                      disabled={isRemoving}
                    />
                    <span className="ml-1 text-sm text-gray-500 min-w-12">
                      {getParameterUnit(paramId)}
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moveParameter(paramId, false)}
                            className="ml-1 h-8 w-8 text-gray-500 hover:text-gray-700"
                            disabled={isRemoving}
                          >
                            <ArrowUpDown className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">Move to variable parameters</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeParameter(paramId, true)}
                            className="h-8 w-8 text-gray-500 hover:text-red-600"
                            disabled={isRemoving}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">Delete parameter</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-500 italic">No constant parameters set</p>
          )}
        </div>
      </div>

      {/* Variable Parameters Section */}
      <div className="space-y-4">
        <div className="flex items-center">
          <h3 className="text-base font-medium text-gray-900">Variable Parameters</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="ml-2 cursor-help">
                  <Info className="h-4 w-4 text-gray-400" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">
                  Variable parameters change between workouts and are tracked for progress. For
                  example, weight added or removed during an exercise.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Add Parameter Selector */}
        {availableParameterTypes.length > 0 && (
          <div className="w-full">
            <Select
              label="Add variable parameter"
              placeholder="Select a parameter to add"
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                if (selected) {
                  handleParameterSelection(selected, false);
                }
              }}
            >
              {availableParameterTypes.map((param) => (
                <SelectItem key={param.id} value={param.id}>
                  <div className="flex items-center">
                    <span>{param.name}</span>
                    {param.defaultUnit && (
                      <span className="ml-1 text-gray-500">({param.defaultUnit})</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </Select>
          </div>
        )}

        {/* Variable Parameters List */}
        <div
          ref={variableContainerRef}
          className="mt-2 grid grid-rows-[auto] transition-all duration-300 ease-in-out"
          style={{
            gridTemplateRows:
              Object.keys(parameters).length === 0
                ? '1fr'
                : `repeat(${Object.keys(parameters).length}, auto)`,
            gap: '0.5rem',
          }}
        >
          {Object.entries(parameters).length > 0 ? (
            Object.entries(parameters).map(([paramId, value]) => {
              const isRemoving = removingParams[paramId];
              const isNew = newParams[paramId];

              return (
                <div
                  key={`param-${paramId}`}
                  className={`flex items-center gap-2 bg-gray-50 p-3 rounded-md border transition-all duration-300 ${
                    isRemoving ? 'animate-fade-out-up' : isNew ? 'animate-fade-in-down' : ''
                  }`}
                >
                  <div className="flex-1 flex items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {getParameterName(paramId)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Input
                      type="number"
                      value={value}
                      onChange={(e) => handleValueChange(paramId, e.target.value, false)}
                      className="w-20 text-right"
                      disabled={isRemoving}
                    />
                    <span className="ml-1 text-sm text-gray-500 min-w-12">
                      {getParameterUnit(paramId)}
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moveParameter(paramId, true)}
                            className="ml-1 h-8 w-8 text-gray-500 hover:text-gray-700"
                            disabled={isRemoving}
                          >
                            <ArrowUpDown className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">Move to constant parameters</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeParameter(paramId, false)}
                            className="h-8 w-8 text-gray-500 hover:text-red-600"
                            disabled={isRemoving}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">Delete parameter</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-500 italic">No variable parameters set</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParameterManager;
