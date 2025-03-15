import React, { useState } from 'react';
import { X } from 'lucide-react';
import NewGroupTab from './new-group-tab';
import ReuseGroupTab from './reuse-group-tab';
import { Tabs, TabItem } from '../ui/tabs';
import { Button } from 'shad/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from '@heroui/drawer';
import { useDisclosure } from '@heroui/react';
import { sampleExercises } from './sample-data';
import { useGroups, useUpdateGroup } from '@/services/hooks';
import { Group } from '@/services/types';

// In the future, this could come from an API
import { GroupFilters } from '@/services/api';

interface GroupSidebarProps {
  group: Group | null;
  onClose: () => void;
  onUpdateGroup?: (group: Group) => void;
  onSave?: (group: Group) => void;
  isOpen: boolean;
  context: GroupFilters;
}

const GroupSidebar: React.FC<GroupSidebarProps> = ({
  group,
  onClose,
  onUpdateGroup,
  onSave,
  isOpen,
  context,
}) => {
  const {
    isOpen: isDrawerOpen,
    onOpenChange,
    onClose: onCloseDrawer,
  } = useDisclosure({ isOpen, onClose });
  const { data: groups } = useGroups({ planId: context.planId });
  const [saveCallback, setSaveCallback] = useState<(() => void) | null>(null);
  const [activeTab, setActiveTab] = useState<'new' | 'reuse'>('new');
  const [currentGroup, setCurrentGroup] = useState<Group | null>(group);

  const tabItems: TabItem[] = [{ id: 'new', label: 'New Group' }];

  if (groups && groups.length > 0) {
    tabItems.push({ id: 'reuse', label: 'Reuse Group' });
  }

  // TODO: Neil - Finish the group sidebar:
  // It should nicely handle either creating a new group or reusing an existing one
  // The NewGroupTab should handle creating a new group or editing a new one nicely via the GroupFormData

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as 'new' | 'reuse');
  };

  const handleSave = () => {
    if (saveCallback) {
      saveCallback();
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
          {activeTab === 'new' && group && (
            <NewGroupTab context={context} group={currentGroup} setSaveCallback={setSaveCallback} />
          )}

          {groups && activeTab === 'reuse' && (
            <ReuseGroupTab
              availableGroups={groups}
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
