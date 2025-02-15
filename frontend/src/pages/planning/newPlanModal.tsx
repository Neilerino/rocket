import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from 'shad/components/ui/dialog';
import { Button } from 'shad/components/ui/button';
import { Input } from 'shad/components/ui/input';
import { Textarea } from 'shad/components/ui/textarea';
import { Label } from 'shad/components/ui/label';
import { useHandlePlanCreation } from './useHandlePlanCreation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'shad/components/ui/select';

interface INewPlanModalProps {
  setShowNewPlanDialog: (show: boolean) => void;
}

const NewPlanModal: React.FC<INewPlanModalProps> = ({ setShowNewPlanDialog }) => {
  const handlePlanCreation = useHandlePlanCreation();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    durationValue: '',
    durationUnit: 'weeks',
    schedule: '',
    userId: 1,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDurationUnitChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      durationUnit: value,
    }));
  };

  const convertToMicroseconds = (value: string, unit: string): number => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 0;

    const conversions: { [key: string]: number } = {
      weeks: 7 * 24 * 60 * 60 * 1000000,
      days: 24 * 60 * 60 * 1000000,
      hours: 60 * 60 * 1000000,
    };

    return Math.floor(numValue * conversions[unit]);
  };

  const handleSubmit = () => {
    const duration = convertToMicroseconds(formData.durationValue, formData.durationUnit);
    handlePlanCreation({
      name: formData.name,
      description: formData.description,
      duration,
      schedule: formData.schedule,
      userId: formData.userId,
    });
    setShowNewPlanDialog(false);
  };

  return (
    <Dialog defaultOpen={true} onOpenChange={setShowNewPlanDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Training Plan</DialogTitle>
          <DialogDescription>
            Create a new climbing training plan. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Plan Title</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Power Endurance Protocol"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your training plan..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="duration">Duration</Label>
              <div className="flex gap-2">
                <Input
                  id="durationValue"
                  name="durationValue"
                  type="number"
                  min="1"
                  value={formData.durationValue}
                  onChange={handleInputChange}
                  placeholder="Duration"
                  className="w-full"
                />
                <Select value={formData.durationUnit} onValueChange={handleDurationUnitChange}>
                  <SelectTrigger className="w-[110px]">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weeks">Weeks</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="schedule">Schedule</Label>
              <Input
                id="schedule"
                name="schedule"
                value={formData.schedule}
                onChange={handleInputChange}
                placeholder="e.g., 3x per week"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setShowNewPlanDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create Plan</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewPlanModal;
