import { Dumbbell, Clock, BarChart, LayoutGrid, Repeat, Timer } from 'lucide-react';
import { Exercise, IntervalExercisePrescription } from '@/services/types';
import { Card, CardHeader, CardBody, CardFooter } from '@heroui/card';
import { Badge } from '@heroui/react';
import { Chip } from '@heroui/chip';

interface ExerciseCardProps {
  exercise: Exercise;
  prescription?: IntervalExercisePrescription;
  onClick?: (exercise: Exercise, prescription?: IntervalExercisePrescription) => void;
  selected?: boolean;
  compact?: boolean;
}

const ExerciseCard = ({
  exercise,
  prescription,
  onClick,
  selected = false,
  compact = false,
}: ExerciseCardProps) => {
  // Helper function to format time intervals (accepts seconds, returns M:SS or H:MM:SS)
  const formatTimeInterval = (seconds?: number): string => {
    if (seconds === undefined || seconds === null || isNaN(seconds) || seconds < 0) return '';

    const totalSeconds = Math.round(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  };

  // Determine if we should render parameter details based on service type structure
  const shouldRenderParameters =
    prescription?.exerciseVariation?.parameters &&
    prescription.exerciseVariation.parameters.length > 0;

  // Generate handler for card click
  const handleClick = () => {
    if (onClick) {
      onClick(exercise, prescription);
    }
  };

  // Use different styling based on whether this is a detailed or compact view
  return (
    <Card
      className={`
        overflow-hidden transition-all shadow-sm border border-gray-200
        ${onClick ? 'cursor-pointer hover:shadow-sm hover:border-gray-300' : ''}
        ${selected ? 'ring-2 ring-primary border-transparent' : ''}
      `}
      onPress={onClick ? handleClick : undefined}
    >
      <CardHeader
        className={`flex flex-row items-center justify-between ${compact ? 'py-3 px-4' : 'p-4'} bg-gradient-to-r from-gray-50 to-white`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-primary flex-shrink-0 rounded-full bg-primary/10 p-0.5`}
          >
            <Dumbbell className="w-full h-full" />
          </div>
          <div>
            <h3 className={`font-medium ${compact ? 'text-base' : 'text-lg'} text-gray-800`}>
              {exercise.name}
            </h3>
            {!compact && exercise.description && (
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{exercise.description}</p>
            )}
          </div>
        </div>

        {/* Sets Chip - Always show if available */}
        {prescription?.sets && (
          <Chip
            color="primary"
            variant="solid"
            size={compact ? 'sm' : 'md'}
            className="font-medium bg-primary text-white"
          >
            {prescription.sets} sets
          </Chip>
        )}
      </CardHeader>

      {/* Card Body - Only shown in detailed view or when there are metrics to display */}
      {(!compact || (compact && prescription)) && (
        <CardBody className={`${compact ? 'py-2 px-4' : 'p-4'}`}>
          {/* Exercise Metrics Grid - Only when prescription data is available in detailed view */}
          {prescription && !compact && (
            <div className="grid grid-cols-2 gap-3 mt-1">
              {/* RPE */}
              {prescription.rpe !== undefined && (
                <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-2.5 border border-gray-100">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600">
                    <BarChart className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">RPE</div>
                    <div className="font-semibold text-gray-800">{prescription.rpe}</div>
                  </div>
                </div>
              )}

              {/* Reps */}
              {prescription.reps !== undefined && (
                <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-2.5 border border-gray-100">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600">
                    <Repeat className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Reps</div>
                    <div className="font-semibold text-gray-800">{prescription.reps}</div>
                  </div>
                </div>
              )}

              {/* Duration */}
              {prescription.duration && (
                <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-2.5 border border-gray-100">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600">
                    <Timer className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Duration</div>
                    <div className="font-semibold text-gray-800">
                      {formatTimeInterval(prescription.duration)}
                    </div>
                  </div>
                </div>
              )}

              {/* Rest Time */}
              {prescription.rest && (
                <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-2.5 border border-gray-100">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Rest</div>
                    <div className="font-semibold text-gray-800">
                      {formatTimeInterval(prescription.rest)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Compact View - Secondary Details Row */}
          {compact && prescription && (
            <div className="flex flex-wrap gap-2">
              {prescription.reps && (
                <Badge variant="flat" color="default" size="sm" className="flex items-center py-0.5 px-2">
                  <div className="flex items-center">
                    <Repeat className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 relative top-px" />
                    <span className="relative top-px">{prescription.reps} reps</span>
                  </div>
                </Badge>
              )}

              {prescription.rpe !== undefined && (
                <Badge variant="flat" color="default" size="sm" className="flex items-center py-0.5 px-2">
                  <div className="flex items-center">
                    <BarChart className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 relative top-px" />
                    <span className="relative top-px">RPE: {prescription.rpe}</span>
                  </div>
                </Badge>
              )}

              {prescription.duration && (
                <Badge variant="flat" color="default" size="sm" className="flex items-center py-0.5 px-2">
                  <div className="flex items-center">
                    <Timer className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 relative top-px" />
                    <span className="relative top-px">{formatTimeInterval(prescription.duration)}</span>
                  </div>
                </Badge>
              )}

              {prescription.rest && (
                <Badge variant="flat" color="default" size="sm" className="flex items-center py-0.5 px-2">
                  <div className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 relative top-px" />
                    <span className="relative top-px">Rest: {formatTimeInterval(prescription.rest)}</span>
                  </div>
                </Badge>
              )}
            </div>
          )}
        </CardBody>
      )}

      {/* Parameters Section - Only in detailed view with parameters */}
      {shouldRenderParameters && !compact && (
        <CardFooter className="bg-gray-50 border-t p-4">
          <div className="w-full">
            {/* Parameters Footer - Updated for service type */}
            <div className={`mt-3 ${compact ? 'pt-2 border-t' : 'pt-4 border-t'}`}>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <LayoutGrid className="w-4 h-4" />
                <span>Parameters</span>
              </div>
              <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
                {/* Iterate over prescription.exerciseVariation.parameters */}
                {prescription!.exerciseVariation!.parameters!.map((param) => {
                  const name = param.parameterType?.name || `Param ${param.parameterTypeId}`;
                  // Value is not available here, display name and unit/locked status
                  // const value = param.value; // Removed
                  const unit = param.parameterType?.defaultUnit || ''; // Use defaultUnit
                  const isLocked = param.locked;

                  return (
                    <div
                      key={param.id} // Use param.id as key
                      className="flex items-center justify-between bg-white p-2.5 rounded-md text-sm border border-gray-100"
                    >
                      <span className="text-gray-600 font-medium">{name}</span>
                      {/* Display unit or locked status instead of value */}
                      <Badge variant="flat" color={isLocked ? "default" : "primary"} size="sm">
                        {isLocked ? `Locked (${unit})` : unit}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default ExerciseCard;
