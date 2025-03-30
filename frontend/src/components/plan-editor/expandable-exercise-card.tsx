import React, { useState } from 'react';
import { ChevronDown, Dumbbell, Lock, Unlock, Loader2 } from 'lucide-react';
import { Exercise, ExerciseVariation } from '@/services/types';
import { Card, CardHeader, CardBody } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { useExerciseVariations } from '@/services/hooks';

interface ExpandableExerciseCardProps {
  exercise: Exercise;
  onVariantSelect?: (variant: ExerciseVariation) => void;
  className?: string;
}

const ExpandableExerciseCard: React.FC<ExpandableExerciseCardProps> = ({
  exercise,
  onVariantSelect,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);

  const { data: variations, isLoading: variationsLoading } = useExerciseVariations({
    exerciseId: exercise.id,
  });

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

  const handleVariantClick = (variant: ExerciseVariation) => {
    setSelectedVariantId(variant.id);
    if (onVariantSelect) {
      onVariantSelect(variant);
    }
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
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                    {exercise.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Chip
                color="primary"
                variant="solid"
                size="md"
                className="font-medium bg-primary text-white"
              >
                {variations?.length} {variations?.length === 1 ? 'variant' : 'variants'}
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

              {variationsLoading ? (
                // Show loader while variations are loading
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : variations && variations.length > 0 ? (
                // Show variations if loaded and available
                <div className="space-y-3 grid grid-cols-1 gap-3 transition-all">
                  {variations.map((variant) => (
                    <div
                      key={variant.id}
                      className={`
                        rounded-lg border p-3 transition-all cursor-pointer
                        ${
                          selectedVariantId === variant.id
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

                      {/* Parameters Section */}
                      {variant.parameters && variant.parameters.length > 0 && (
                        <div className="mt-3 space-y-2 bg-gray-50 p-2 rounded-md">
                          <div className="text-xs uppercase tracking-wide text-gray-500 font-medium">
                            Parameters
                          </div>

                          {/* Combined Parameters List */}
                          <div className="space-y-1.5">
                            {variant.parameters.map((param) => (
                              <div
                                key={param.id} // Use the ExerciseVariationParam id
                                className="flex items-center gap-2 text-sm"
                              >
                                {param.locked ? (
                                  <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 relative top-px" />
                                ) : (
                                  <Unlock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 relative top-px" />
                                )}
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-gray-700">
                                    {param.parameterType?.name || 'Unknown Parameter'}{' '}
                                    {/* Access name via nested object */}
                                  </span>
                                  {param.parameterType
                                    ?.defaultUnit /* Access unit via nested object */ && (
                                    <span className="text-xs text-gray-500">
                                      ({param.parameterType.defaultUnit})
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                // Show message if no variations found after loading
                <div className="text-sm text-gray-500 py-4 text-center">
                  No variations found for this exercise.
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
