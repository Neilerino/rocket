import React from 'react';
import { Switch } from '@heroui/switch'; // Assuming path alias setup for shadcn/ui
import { Label } from 'shad/components/ui/label'; // Assuming path alias setup for shadcn/ui

interface ToggleFormHeaderProps {
  title: string;
  isToggled: boolean;
  onToggle: (toggled: boolean) => void;
  // Optional: Add className prop for custom styling
  className?: string;
}

const ToggleFormHeader: React.FC<ToggleFormHeaderProps> = ({
  title,
  isToggled,
  onToggle,
  className = '',
}) => {
  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onToggle(e.target.checked);
  };

  return (
    <div className={`flex items-center justify-between mb-2 ${className}`}>
      <Label
        htmlFor={`toggle-${title}`}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {title}
      </Label>
      <Switch id={`toggle-${title}`} isSelected={isToggled} onChange={handleToggleChange} />
    </div>
  );
};

export default ToggleFormHeader;
