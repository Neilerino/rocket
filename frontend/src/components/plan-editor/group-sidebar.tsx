import React, { useState, useEffect } from 'react';
import { Group } from './types';
import { X } from 'lucide-react';
import NewGroupTab from './new-group-tab';
import ReuseGroupTab from './reuse-group-tab';
import { Tabs, TabItem } from '../ui/tabs';
import { Button } from 'shad/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from '@heroui/drawer';
import { useDisclosure } from '@heroui/react';
import { sampleExercises } from './sample-data';

// In the future, this could come from an API
import { generateSamplePlanData } from './sample-data';

interface GroupSidebarProps {
  group: Group | null;
  onClose: () => void;
  onUpdateGroup?: (group: Group) => void;
  onSave?: (group: Group) => void;
  isOpen: boolean;
}

const GroupSidebar: React.FC<GroupSidebarProps> = ({
  group,
  onClose,
  onUpdateGroup,
  onSave,
  isOpen,
}) => {
  const {
    isOpen: isDrawerOpen,
    onOpenChange,
    onClose: onCloseDrawer,
  } = useDisclosure({ isOpen, onClose });

  const [activeTab, setActiveTab] = useState<'new' | 'reuse'>('new');
  const [currentGroup, setCurrentGroup] = useState<Group | null>(group);

  // This state would be populated from an API in a real app
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);

  // Fetch available groups (simulated with sample data for now)
  useEffect(() => {
    // This would be an API call in a real implementation
    const fetchGroups = async () => {
      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Get sample data
        const sampleData = generateSamplePlanData();

        // Extract all groups from the intervals
        const groups = sampleData.intervals.flatMap((interval) => interval.groups);

        // Filter out the current group if it exists
        const filteredGroups = groups.filter((g) => g.id !== group?.id);

        setAvailableGroups(filteredGroups);
      } catch (error) {
        console.error('Error fetching groups:', error);
        // In a real app, you might want to show an error state
      }
    };

    if (isDrawerOpen) {
      fetchGroups();
    }
  }, [isDrawerOpen, group?.id]);

  // Define the tab items
  const tabItems: TabItem[] = [
    { id: 'new', label: 'New Group' },
    { id: 'reuse', label: 'Reuse Group' },
  ];

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as 'new' | 'reuse');
  };

  const handleReuseGroup = (existingGroup: Group) => {
    const updatedGroup = {
      ...existingGroup,
      id: group.id, // Keep the current ID but use all other properties from existing group
    };

    setCurrentGroup(updatedGroup);

    if (onUpdateGroup) {
      onUpdateGroup(updatedGroup);
    }

    setActiveTab('new'); // Switch back to new tab after reusing
  };

  const handleUpdateGroup = (updatedGroup: Group) => {
    setCurrentGroup(updatedGroup);
    if (onUpdateGroup) {
      onUpdateGroup(updatedGroup);
    }
  };

  const handleSave = () => {
    if (currentGroup && onSave) {
      onSave(currentGroup);
    }
    onCloseDrawer();
  };

  const drawerCloseButton = (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full hover:bg-gray-100 absolute right-4 top-4 z-10"
    >
      <X className="h-5 w-5" />
    </Button>
  );

  // Create a list of all exercises for reference when displaying group exercises
  const allExercises = [...sampleExercises];

  return (
    <Drawer
      isOpen={isDrawerOpen}
      onOpenChange={onOpenChange}
      onClose={onCloseDrawer}
      placement="right"
      size="lg"
      closeButton={drawerCloseButton}
    >
      <DrawerContent className="flex flex-col h-full">
        {/* Header */}
        <DrawerHeader className="border-b px-4 py-4">
          <h2 className="text-xl font-semibold">Group Editor</h2>
        </DrawerHeader>

        {/* Tabs */}
        <div className="border-b">
          <Tabs
            tabs={tabItems}
            activeTabId={activeTab}
            onTabChange={handleTabChange}
            equalWidth={true}
          />
        </div>

        {/* Content Area */}
        <DrawerBody className="flex-1 overflow-auto p-6">
          {activeTab === 'new' && group && onUpdateGroup && (
            <NewGroupTab
              group={currentGroup || group}
              onUpdateGroup={handleUpdateGroup}
              allGroups={availableGroups}
            />
          )}

          {activeTab === 'reuse' && (
            <ReuseGroupTab
              availableGroups={availableGroups}
              onSelectGroup={handleReuseGroup}
              allExercises={allExercises}
            />
          )}
        </DrawerBody>

        {/* Footer with Action Buttons */}
        <DrawerFooter className="border-t p-4 bg-gray-50">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCloseDrawer}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default GroupSidebar;
