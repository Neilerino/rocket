import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Button } from '@heroui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
}) => {
  // Define variant-specific styling
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-red-500" />,
          confirmButtonVariant: 'solid' as const,
          confirmButtonColor: 'danger' as const,
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-amber-500" />,
          confirmButtonVariant: 'bordered' as const,
          confirmButtonColor: 'warning' as const,
        };
      case 'info':
      default:
        return {
          icon: <AlertTriangle className="h-6 w-6 text-blue-500" />,
          confirmButtonVariant: 'bordered' as const,
          confirmButtonColor: 'primary' as const,
        };
    }
  };

  const variantStyles = getVariantStyles();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="sm:max-w-[425px]">
        <ModalHeader className="flex items-center gap-3">
          {variantStyles.icon}
          <h2 className="text-lg font-semibold">{title}</h2>
        </ModalHeader>

        <ModalBody>
          <p className="text-sm text-gray-500">{message}</p>
        </ModalBody>

        <ModalFooter className="flex space-x-2 justify-end">
          <Button variant="flat" onPress={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={variantStyles.confirmButtonVariant}
            color={variantStyles.confirmButtonColor}
            onPress={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmationModal;
