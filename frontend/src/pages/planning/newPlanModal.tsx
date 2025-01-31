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

interface INewPlanModalProps {
  setShowNewPlanDialog: (show: boolean) => void;
}

const NewPlanModal: React.FC<INewPlanModalProps> = ({ setShowNewPlanDialog }) => {
  const handlePlanCreation = useHandlePlanCreation();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    schedule: '',
    userId: 2,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    handlePlanCreation(formData);
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
              <Input
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="e.g., 8 weeks"
              />
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
