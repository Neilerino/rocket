import React, { ComponentProps } from 'react';
import { Input } from 'shad/components/ui/input';
import { Label } from 'shad/components/ui/label';

// --- Grouping Component --- 

interface StopwatchInputGroupProps {
  id?: string; // Optional id for the group label association
  label?: string;
  children: React.ReactNode;
  errorDisplay?: React.ReactNode;
  className?: string;
}

/**
 * Provides layout and labeling for StopwatchMinutesInput and StopwatchSecondsInput.
 */
export const StopwatchInputGroup: React.FC<StopwatchInputGroupProps> = ({
  id,
  label,
  children,
  errorDisplay,
  className
}) => {
  return (
    <div className={`space-y-1 ${className || ''}`}>
      {/* Associate label with the first input if id is provided and label exists */}
      {label && <Label htmlFor={id ? `${id}-minutes` : undefined}>{label}</Label>}
      <div className="flex items-stretch gap-2">{children}</div>
      {errorDisplay && <div className="mt-1">{errorDisplay}</div>}
    </div>
  );
};

// --- Individual Input Components --- 

type BaseInputProps = ComponentProps<'input'>;

/**
 * An input field specifically for minutes.
 */
export const StopwatchMinutesInput: React.FC<BaseInputProps> = ({
  id = 'minutes',
  className,
  ...props 
}) => {
  return (
    <div className="flex-1 space-y-1">
      <Label htmlFor={id} className="text-xs text-gray-500">
        Minutes
      </Label>
      <Input
        type="number"
        id={id}
        min={0}
        className={className}
        {...props}
      />
    </div>
  );
};

/**
 * An input field specifically for seconds (0-59).
 */
export const StopwatchSecondsInput: React.FC<BaseInputProps> = ({
  id = 'seconds',
  className,
  ...props 
}) => {
  return (
    <div className="flex-1 space-y-1">
      <Label htmlFor={id} className="text-xs text-gray-500">
        Seconds
      </Label>
      <Input
        type="number"
        id={id}
        min={0}
        max={59}
        step={5}
        className={className}
        {...props}
      />
    </div>
  );
};

interface StopwatchInputProps {
  id: string;
  label: string;
  value: number | null | undefined; 
  onChange: (totalSeconds: number | null) => void;
  showError?: boolean;
}

const StopwatchInput: React.FC<StopwatchInputProps> = ({
  id,
  label,
  value,
  onChange,
  showError = false,
}) => {
  const totalSeconds = value ?? 0;
  const currentMinutes = Math.floor(totalSeconds / 60);
  const currentSeconds = totalSeconds % 60;

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const mins = parseInt(e.target.value, 10);
    if (isNaN(mins)) {
      onChange(currentSeconds > 0 ? currentSeconds : null);
    } else {
      onChange(Math.max(0, mins) * 60 + currentSeconds);
    }
  };

  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const secs = parseInt(e.target.value, 10);
    if (isNaN(secs)) {
      onChange(currentMinutes > 0 ? currentMinutes * 60 : null);
    } else {
      const clampedSeconds = Math.max(0, Math.min(secs, 59));
      const newTotal = currentMinutes * 60 + clampedSeconds;
      onChange(newTotal === 0 ? null : newTotal);
    }
  };

  const errorClass = showError ? 'border-destructive' : '';

  return (
    <StopwatchInputGroup id={id} label={label} errorDisplay={showError && <div>Error</div>}>
      <StopwatchMinutesInput
        id={`${id}-minutes`}
        value={currentMinutes === 0 && !currentSeconds ? '' : currentMinutes}
        onChange={handleMinutesChange}
        className={errorClass}
      />
      <StopwatchSecondsInput
        id={`${id}-seconds`}
        value={currentSeconds === 0 && !currentMinutes ? '' : currentSeconds}
        onChange={handleSecondsChange}
        className={errorClass}
      />
    </StopwatchInputGroup>
  );
};

export default StopwatchInput;
