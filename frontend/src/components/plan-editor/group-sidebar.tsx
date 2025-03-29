import React, { useRef, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import NewGroupTab from './new-group-tab';
import ReuseGroupTab from './reuse-group-tab';
import { Tabs, TabItem } from '../ui/tabs';
import { Button } from 'shad/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from '@heroui/drawer';
import { useDisclosure } from '@heroui/react';
import { useGroups } from '@/services/hooks';
import { Group } from '@/services/types';
import { GroupFilters } from '@/services/api';

interface GroupSidebarProps {
  group: Group | null;
  onClose: () => void;
  onSave?: (group: Group) => void;
  isOpen: boolean;
  context: GroupFilters;
}

const GroupSidebar: React.FC<GroupSidebarProps> = ({ group, onClose, onSave, isOpen, context }) => {
  const {
    isOpen: isDrawerOpen,
    onOpenChange,
    onClose: onCloseDrawer,
  } = useDisclosure({ isOpen, onClose });
  const { data: groups } = useGroups({ planId: context.planId });
  const saveCallback = useRef<(() => Promise<Group>) | null>(null);
  const [activeTab, setActiveTab] = useState<'new' | 'reuse'>('new');
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const tabItems: TabItem[] = [{ id: 'new', label: 'New Group' }];

  if (groups && groups.length > 0) {
    tabItems.push({ id: 'reuse', label: 'Reuse Group' });
  }

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as 'new' | 'reuse');
  };

  const handleSave = async () => {
    if (saveCallback.current) {
      setIsLoading(true); // Start loading
      try {
        const newGroup = await saveCallback.current();
        onSave?.(newGroup);
        onCloseDrawer(); // Close only on success
      } catch (error) {
        console.error('Failed to save group:', error);
        // Optionally, show an error message to the user
      } finally {
        setIsLoading(false); // Stop loading regardless of outcome
      }
    }
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
          {activeTab === 'new' && (
            <NewGroupTab context={context} group={group} saveCallback={saveCallback} />
          )}

          {groups && activeTab === 'reuse' && (
            <ReuseGroupTab context={context} saveCallback={saveCallback} />
          )}
        </DrawerBody>

        {/* Footer with Action Buttons */}
        <DrawerFooter className="border-t p-4 bg-gray-50">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCloseDrawer}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Group'
              )}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default GroupSidebar;
