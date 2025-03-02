import React, { useRef, useEffect, ReactNode, useState } from 'react';
import { Check } from 'lucide-react';
import { Input } from './input';

export interface TabItem {
  id: string;
  label: ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: TabItem[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  onSave?: (tabId: string, newLabel: string) => void;
  rightContent?: ReactNode;
  actionButton?: ReactNode;
  className?: string;
  fullWidth?: boolean;
  equalWidth?: boolean;
  variant?: 'default' | 'minimal' | 'pills';
  size?: 'default' | 'sm' | 'lg';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTabId,
  onTabChange,
  onSave,
  rightContent,
  actionButton,
  className = '',
  fullWidth = false,
  equalWidth = false,
  variant = 'default',
  size = 'default',
}) => {
  const tabsRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle double click to edit
  const handleDoubleClick = (tabId: string, label: ReactNode) => {
    if (!onSave) return; // Only allow editing if onSave is provided
    
    // If the label is a React element, try to extract its text content
    let initialValue = '';
    if (typeof label === 'string') {
      initialValue = label;
    } else if (React.isValidElement(label) && typeof label.props.children === 'string') {
      initialValue = label.props.children;
    } else if (React.isValidElement(label) && label.props.children?.props?.children) {
      // Handle the case where the label is a span with text content
      initialValue = label.props.children.props.children;
    }
    
    setEditingTabId(tabId);
    setEditingValue(initialValue);
    
    // Focus the input after it's rendered
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 10);
  };

  // Handle save
  const handleSave = () => {
    if (editingTabId && onSave) {
      onSave(editingTabId, editingValue);
      setEditingTabId(null);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditingTabId(null);
    }
  };

  // Update the indicator position
  useEffect(() => {
    if (!indicatorRef.current || !tabsRef.current) return;

    // Don't update indicator when editing the active tab
    if (editingTabId === activeTabId) {
      indicatorRef.current.style.opacity = '0';
      return;
    }

    const indicator = indicatorRef.current;

    if (equalWidth && tabs.length > 0) {
      // For equal width tabs, calculate position based on index
      const tabWidth = 100 / tabs.length;
      const activeIndex = tabs.findIndex((tab) => tab.id === activeTabId);

      if (activeIndex !== -1) {
        indicator.style.width = `${tabWidth}%`;
        indicator.style.left = `${activeIndex * tabWidth}%`;
      }
    } else {
      // For variable width tabs, find the DOM element
      const tabsContainer = tabsRef.current;
      const selectedTab = tabsContainer.querySelector(
        `[data-tab-id="${activeTabId}"]`,
      ) as HTMLElement;

      if (selectedTab) {
        indicator.style.width = `${selectedTab.offsetWidth}px`;
        indicator.style.transform = `translateX(${selectedTab.offsetLeft}px)`;
      }
    }

    indicator.style.opacity = '1';
  }, [activeTabId, tabs, equalWidth, editingTabId]);

  // Get appropriate classes based on variant and size
  const getTabsContainerClasses = () => {
    let classes = 'relative ';

    if (fullWidth) {
      classes += 'w-full ';
    }

    if (equalWidth) {
      classes += 'grid ' + (tabs.length > 0 ? `grid-cols-${tabs.length} ` : '');
    } else {
      classes += 'flex ';
    }

    return classes;
  };

  const getTabItemClasses = (tabId: string) => {
    let classes = 'cursor-pointer transition-colors ';

    // Size classes
    if (size === 'sm') {
      classes += 'px-3 py-1.5 text-sm ';
    } else if (size === 'lg') {
      classes += 'px-6 py-3 text-base ';
    } else {
      // default
      classes += 'px-4 py-2 ';
    }

    // Variant classes
    if (variant === 'minimal') {
      classes +=
        activeTabId === tabId ? 'text-primary font-medium ' : 'text-gray-600 hover:text-gray-900 ';
    } else if (variant === 'pills') {
      classes +=
        activeTabId === tabId
          ? 'bg-primary/10 text-primary font-medium rounded-md '
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60 rounded-md ';
    } else {
      // default
      classes +=
        activeTabId === tabId ? 'font-medium text-primary ' : 'text-gray-600 hover:text-gray-900 ';
    }

    if (equalWidth) {
      classes += 'text-center ';
    }
    
    // Add editing class
    if (editingTabId === tabId) {
      classes += 'overflow-visible z-10 ';
    }

    return classes;
  };

  const getIndicatorClasses = () => {
    let classes = 'absolute bottom-0 h-0.5 bg-primary transition-all duration-300 opacity-0 ';

    if (variant === 'pills') {
      classes = 'hidden'; // No indicator for pills variant
    }

    return classes;
  };

  // Render tab label - either as an editable input or the normal label
  const renderTabLabel = (tab: TabItem) => {
    if (editingTabId === tab.id) {
      return (
        <div className="flex items-center w-full gap-1">
          <Input
            ref={inputRef}
            type="text"
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={() => setEditingTabId(null)}
            className="h-7 min-w-[80px] px-1 py-0 border-0 shadow-none focus-visible:ring-0 focus-visible:border-b focus-visible:border-primary rounded-none bg-gray-50/50"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSave();
            }}
            className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 text-gray-600 hover:text-primary"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }
    
    return tab.label;
  };

  return (
    <div className={`flex items-stretch h-full ${className}`}>
      <div className="flex-grow relative">
        <div ref={tabsRef} className={getTabsContainerClasses()}>
          {tabs.map((tab) => (
            <div
              key={tab.id}
              data-tab-id={tab.id}
              className={getTabItemClasses(tab.id)}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              onDoubleClick={() => handleDoubleClick(tab.id, tab.label as string)}
            >
              {renderTabLabel(tab)}
            </div>
          ))}

          {/* Animated indicator */}
          <div ref={indicatorRef} className={getIndicatorClasses()} style={{ height: '2px' }} />
        </div>
      </div>

      {rightContent && <div className="flex-none px-2 py-2 ml-2 border-l border-gray-200">{rightContent}</div>}
      
      {actionButton && (
        <div className="border-l border-gray-200 flex items-stretch">
          {actionButton}
        </div>
      )}
    </div>
  );
};
