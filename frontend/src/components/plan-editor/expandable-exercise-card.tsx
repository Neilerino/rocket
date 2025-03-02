import React, { useState } from 'react';
import { ChevronDown, Dumbbell, Timer, BarChart, Repeat, Clock, Lock, Unlock } from 'lucide-react';
import { Exercise, ExercisePrescription, ParameterType } from './types';
import { Card, CardHeader, CardBody } from '@heroui/card';
import { Badge } from '@heroui/react';
import { Chip } from '@heroui/chip';

interface ExerciseVariant {
  id: string;
  name?: string;
  prescription: ExercisePrescription;
}

interface ExpandableExerciseCardProps {
  exercise: Exercise;
  variants?: ExerciseVariant[];
  parameterTypes?: ParameterType[];
  onVariantSelect?: (variant: ExerciseVariant) => void;
  className?: string;
}

const ExpandableExerciseCard: React.FC<ExpandableExerciseCardProps> = ({
  exercise,
  variants = [],
  parameterTypes = [],
  onVariantSelect,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  // Helper function to format time intervals (like "00:01:30" to "1:30")
  const formatTimeInterval = (interval?: string): string => {
    if (!interval) return '';

    // Remove leading zeros and potentially the hour part if it's 0
    const parts = interval.split(':').map((part) => parseInt(part, 10));
    if (parts.length !== 3) return interval;

    const [hours, minutes, seconds] = parts;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleVariantClick = (variant: ExerciseVariant) => {
    setSelectedVariant(variant.id);
    if (onVariantSelect) {
      onVariantSelect(variant);
    }
  };

  // Get parameter name from parameter type ID
  const getParameterName = (paramId: string): string => {
    const paramType = parameterTypes.find((pt) => pt.id === paramId);
    return paramType?.name || paramId;
  };

  // Get parameter unit from parameter type ID
  const getParameterUnit = (paramId: string): string => {
    const paramType = parameterTypes.find((pt) => pt.id === paramId);
    return paramType?.defaultUnit || '';
  };

  return (
    <div className={className}>
      <Card
        className={`
          overflow-hidden transition-all duration-200 border border-gray-200 shadow-sm w-full
          hover:border-gray-300
        `}
      >
        <CardHeader className="p-0">
          {/* Header - Always visible */}
          <div 
            className="p-4 flex items-center justify-between w-full bg-gradient-to-r from-gray-50 to-white cursor-pointer"
            onClick={handleToggle}
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 text-primary flex-shrink-0 rounded-full bg-primary/10 p-0.5 flex items-center justify-center">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-medium text-lg text-gray-800">{exercise.name}</h3>
                {exercise.description && (
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{exercise.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Chip
                color="primary"
                variant="filled"
                size="md"
                className="font-medium bg-primary text-white"
              >
                {variants.length} {variants.length === 1 ? 'variant' : 'variants'}
              </Chip>

              <button
                type="button"
                className={`
                  p-1 rounded-full hover:bg-gray-100 text-gray-500
                  transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-0'}
                  flex items-center justify-center
                `}
                onClick={handleToggle}
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>
        </CardHeader>

        {/* Expanded content with animation */}
        <div
          className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          <CardBody className="px-4 pb-4 border-t border-gray-100 pt-3 bg-gray-50/50">
            {/* Variants list */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-wide text-gray-500 font-medium">
                Exercise Variants
              </h4>
              
              {variants.length > 0 ? (
                <div className="space-y-3 grid grid-cols-1 gap-3 transition-all">
                  {variants.map((variant) => (
                    <div
                      key={variant.id}
                      className={`
                        rounded-lg border p-3 transition-all cursor-pointer
                        ${selectedVariant === variant.id
                          ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                        }
                        animate-fade-in-down
                      `}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVariantClick(variant);
                      }}
                    >
                      {/* Variant Name (if exists) */}
                      {variant.name && (
                        <div className="font-medium text-gray-800 mb-2">{variant.name}</div>
                      )}
                      
                      {/* Basic Metrics */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {variant.prescription.sets && (
                          <Badge variant="soft" color="primary" className="flex items-center py-0.5 px-2">
                            {variant.prescription.sets} sets
                          </Badge>
                        )}
                        
                        {variant.prescription.reps && (
                          <Badge variant="soft" color="neutral" className="flex items-center py-0.5 px-2">
                            <div className="flex items-center">
                              <Repeat className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 relative top-px" />
                              <span className="relative top-px">{variant.prescription.reps} reps</span>
                            </div>
                          </Badge>
                        )}
                        
                        {variant.prescription.rpe !== undefined && (
                          <Badge variant="soft" color="neutral" className="flex items-center py-0.5 px-2">
                            <div className="flex items-center">
                              <BarChart className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 relative top-px" />
                              <span className="relative top-px">RPE: {variant.prescription.rpe}</span>
                            </div>
                          </Badge>
                        )}
                        
                        {variant.prescription.rest && (
                          <Badge variant="soft" color="neutral" className="flex items-center py-0.5 px-2">
                            <div className="flex items-center">
                              <Clock className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 relative top-px" />
                              <span className="relative top-px">Rest: {formatTimeInterval(variant.prescription.rest)}</span>
                            </div>
                          </Badge>
                        )}
                      </div>

                      {/* Parameters Section */}
                      {(Object.keys(variant.prescription.parameters || {}).length > 0 ||
                        Object.keys(variant.prescription.lockedParameters || {}).length > 0) && (
                        <div className="mt-3 space-y-2 bg-gray-50 p-2 rounded-md">
                          <div className="text-xs uppercase tracking-wide text-gray-500 font-medium">
                            Parameters
                          </div>
                          
                          {/* Fixed Parameters */}
                          {Object.entries(variant.prescription.lockedParameters || {}).length > 0 && (
                            <div className="space-y-1.5">
                              {Object.entries(variant.prescription.lockedParameters || {}).map(
                                ([paramId, value]) => (
                                  <div key={`fixed-${paramId}`} className="flex items-center gap-2 text-sm">
                                    <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 relative top-px" />
                                    <div className="flex items-baseline gap-1.5">
                                      <span className="text-gray-700">
                                        {getParameterName(paramId)}:
                                      </span>
                                      <span className="font-medium">
                                        {value}
                                        {getParameterUnit(paramId) && (
                                          <span className="text-gray-500 ml-1">
                                            {getParameterUnit(paramId)}
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                          
                          {/* Variable Parameters */}
                          {Object.entries(variant.prescription.parameters || {}).length > 0 && (
                            <div className="space-y-1.5">
                              {Object.entries(variant.prescription.parameters || {}).map(
                                ([paramId, value]) => (
                                  <div key={`var-${paramId}`} className="flex items-center gap-2 text-sm">
                                    <Unlock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 relative top-px" />
                                    <div className="flex items-baseline gap-1.5">
                                      <span className="text-gray-700">
                                        {getParameterName(paramId)}:
                                      </span>
                                      <span className="font-medium">
                                        {value}
                                        {getParameterUnit(paramId) && (
                                          <span className="text-gray-500 ml-1">
                                            {getParameterUnit(paramId)}
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic py-2">
                  No variants available for this exercise
                </div>
              )}
            </div>
          </CardBody>
        </div>
      </Card>
    </div>
  );
};

export default ExpandableExerciseCard;
