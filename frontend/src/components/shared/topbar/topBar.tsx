import React from 'react';
import { Bell } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from 'shad/components/ui/avatar';
import { Button } from 'shad/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'shad/components/ui/dropdown-menu';
import { SidebarTrigger } from 'shad/components/ui/sidebar';
import { Separator } from 'shad/components/ui/separator';

const TopBar = () => {
  return (
    <div className="w-full h-14 border-b bg-background shadow-[0_1px_3px_0_rgb(0,0,0,0.1),0_1px_2px_-1px_rgb(0,0,0,0.1)] relative z-10">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="hover:bg-accent hover:text-accent-foreground rounded-full p-2" />
          <Separator orientation="vertical" className="h-4" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative rounded-full w-10 h-10">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              2
            </span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src="https://gravatar.com/avatar/35b761f6837593a726bebc6dafdbfd9d?s=400&d=mp&r=x"
                    alt="User"
                  />
                  <AvatarFallback>NW</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Neil</p>
                  <p className="text-xs leading-none text-muted-foreground">neil@example.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
