import React, { useState } from 'react';
import {
  Group,
  PlanInterval as ServicePlanInterval,
  IntervalExercisePrescription,
  Exercise as ServiceExercise,
} from '@/services/types';
import ExerciseSidebar from './exercise-sidebar';
import GroupSidebar from './group-sidebar';
import { AnimatePresence } from 'framer-motion';
import { ChevronRight, Trash2, Edit } from 'lucide-react';
import IntervalEditDialog from './interval-edit-dialog';
import IntervalGroupTabs from './interval-group-tabs';
import { motion } from 'framer-motion';

interface IntervalEditorProps {
  interval: ServicePlanInterval;
  isExpanded: boolean;
  onToggle: () => void;
  onDeleteInterval?: (intervalId: number) => void;
}

const IntervalEditor: React.FC<IntervalEditorProps> = ({
  interval,
  isExpanded,
  onToggle,
  onDeleteInterval,
}) => {
  const groupContext = { intervalId: interval.id, planId: interval.planId };

  const [exerciseDrawerOpen, setExerciseDrawerOpen] = useState(false);
  const [groupDrawerOpen, setGroupDrawerOpen] = useState(false);
  const [selectedPrescriptionToEdit, setSelectedPrescriptionToEdit] =
    useState<IntervalExercisePrescription | null>(null);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleDeleteInterval = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteInterval) {
      onDeleteInterval(interval.id);
    }
  };

  const handleEditInterval = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditDialog(true);
  };

  const handleSetSelectedExercise = (exercise: ServiceExercise | null) => {
    console.log('Exercise selected in IntervalGroupTabs:', exercise);
    // TODO: Implement logic if needed - e.g., populate sidebar form based on selection?
  };

  return (
    <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
      <div
        className={`
          p-4 flex items-center justify-between bg-white cursor-pointer hover:bg-gray-50 transition-colors duration-200
          ${isExpanded ? 'border-b border-gray-200' : ''} 
        `}
        onClick={onToggle}
      >
        <div className="flex items-start flex-1">
          <div
            className="w-5 h-5 mr-2 text-gray-500 transition-transform duration-200 mt-1"
            style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
          >
            <ChevronRight className="w-full h-full" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-medium">{interval.name}</h2>
            <div className="mt-1 space-y-1">
              {interval.description && (
                <p className="text-sm text-gray-500">{interval.description}</p>
              )}
              <div className="flex space-x-4 text-sm">
                <span className="text-gray-500">{interval.duration}</span>
                <span className="text-gray-500">
                  {interval.groupCount} {interval.groupCount === 1 ? 'session' : 'sessions'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            className="p-1.5 text-gray-400 hover:text-blue-500 rounded-full hover:bg-gray-100 transition-colors duration-200"
            onClick={handleEditInterval}
            aria-label="Edit interval"
          >
            <Edit size={18} />
          </button>

          <button
            className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors duration-200"
            onClick={handleDeleteInterval}
            aria-label="Delete interval"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Edit Interval Dialog */}
      <IntervalEditDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        interval={interval}
      />

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <IntervalGroupTabs
              intervalId={interval.id}
              onGroupDrawerOpen={() => setGroupDrawerOpen(true)}
              onExerciseDrawerOpen={() => setExerciseDrawerOpen(true)}
              setSelectedExercise={handleSetSelectedExercise}
              currentGroup={currentGroup}
              setCurrentGroup={setCurrentGroup}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <ExerciseSidebar
        prescriptionToEdit={selectedPrescriptionToEdit}
        onClose={() => {
          setSelectedPrescriptionToEdit(null);
          setExerciseDrawerOpen(false);
        }}
        isOpen={exerciseDrawerOpen}
        currentGroup={currentGroup}
        interval={interval}
      />
      <GroupSidebar
        group={currentGroup}
        onClose={() => {
          setGroupDrawerOpen(false);
        }}
        isOpen={groupDrawerOpen}
        onSave={(group) => {
          setCurrentGroup(group);
        }}
        context={groupContext}
      />
    </div>
  );
};

export default IntervalEditor;
