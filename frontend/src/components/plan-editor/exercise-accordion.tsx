import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Label } from 'shad/components/ui/label';

interface AccordionItemProps {
  children: ReactNode;
  value: string;
  title: string;
  checked: boolean;
  onCheckChange: (checked: boolean) => void;
}

export function AccordionItem({ children, title, checked, onCheckChange }: AccordionItemProps) {
  const handleClick = () => {
    onCheckChange(!checked);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onCheckChange(e.target.checked);
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        className="flex w-full items-center justify-between py-2 px-0 bg-transparent hover:bg-transparent"
      >
        <div className="flex items-center justify-between w-full">
          <Label>{title}</Label>
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={checked}
              onChange={handleCheckboxChange}
              className="h-4 w-4"
            />
          </div>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {checked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden bg-transparent"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
