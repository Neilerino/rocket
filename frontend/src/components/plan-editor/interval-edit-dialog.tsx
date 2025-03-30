import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Textarea } from '@heroui/input';
import { PlanInterval } from '@/services/types';

import { useUpdateInterval } from '@/services/hooks';

interface IntervalEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  interval: PlanInterval;
}

const IntervalEditDialog: React.FC<IntervalEditDialogProps> = ({ isOpen, onClose, interval }) => {
  const [name, setName] = useState(interval.name);
  const [description, setDescription] = useState(interval.description || '');
  const [duration, setDuration] = useState(interval.duration);

  const { mutate: updateInterval } = useUpdateInterval();

  const handleSave = () => {
    updateInterval({ id: interval.id, name, description, duration });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="sm:max-w-[500px]">
        <ModalHeader className="flex items-center">
          <h2 className="text-lg font-semibold">Edit Interval</h2>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="interval-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Interval Name
              </label>
              <Input
                id="interval-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Week 1, Mesocycle 2, etc."
                className="w-full"
              />
            </div>

            <div>
              <label
                htmlFor="interval-description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <Textarea
                id="interval-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the focus or goal of this interval..."
                className="w-full min-h-[100px]"
              />
            </div>

            <div>
              <label
                htmlFor="interval-duration"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Duration
              </label>
              <Input
                id="interval-duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g., 7 days, 1 week, etc."
                className="w-full"
              />
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="flex space-x-2 justify-end">
          <Button variant="flat" onPress={onClose}>
            Cancel
          </Button>
          <Button variant="solid" color="primary" onPress={handleSave}>
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default IntervalEditDialog;
