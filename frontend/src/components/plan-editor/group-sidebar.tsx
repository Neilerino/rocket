import { useState } from 'react';
import { Button } from 'shad/components/ui/button';
import { Sheet, SheetContent, SheetClose } from 'shad/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'shad/components/ui/tabs';
import { ScrollArea } from 'shad/components/ui/scroll-area';
import { X as CloseIcon } from 'lucide-react';
import { Group } from './types';
import NewGroupTab from './new-group-tab';
import ReuseGroupTab from './reuse-group-tab';

interface GroupSidebarProps {
  group: Group | null;
  onClose: () => void;
  allGroups?: Group[];
  onUpdateGroup?: (group: Group) => void;
}

const GroupSidebar = ({ group, onClose, allGroups = [], onUpdateGroup }: GroupSidebarProps) => {
  const [activeTab, setActiveTab] = useState<'new' | 'reuse'>('new');
  const availableGroups = allGroups.filter((g) => g.id !== group?.id);

  if (!group) return null;

  const handleReuseGroup = (existingGroup: Group) => {
    if (onUpdateGroup) {
      onUpdateGroup({
        ...existingGroup,
        id: group.id, // Keep the current ID but use all other properties from existing group
      });
    }
    setActiveTab('new'); // Switch back to new tab after reusing
  };

  return (
    <Sheet open={!!group} onOpenChange={onClose}>
      <SheetContent
        className="w-96 p-0 [&>button]:hidden"
        side="right"
        onWheel={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">Add Group</h2>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                <CloseIcon className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>

          <ScrollArea className="flex-1">
            <div className="px-6 py-4">
              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as 'new' | 'reuse')}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="new">New Group</TabsTrigger>
                  <TabsTrigger value="reuse">Reuse Group</TabsTrigger>
                </TabsList>
                <TabsContent value="new" className="space-y-4 mt-4">
                  {group && onUpdateGroup && (
                    <NewGroupTab
                      group={group}
                      onUpdateGroup={onUpdateGroup}
                      allGroups={allGroups}
                    />
                  )}
                </TabsContent>
                <TabsContent value="reuse" className="mt-4">
                  <ReuseGroupTab
                    availableGroups={availableGroups}
                    onSelectGroup={handleReuseGroup}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default GroupSidebar;
