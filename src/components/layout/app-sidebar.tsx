
'use client';

import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { MessageSquare, Trash2, Loader2, BrainCircuit } from 'lucide-react'; // Added BrainCircuit, removed PlusCircle
import { useChat, type Chat } from '@/context/chat-context';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


const AppSidebar: React.FC = () => {
  const {
    chats,
    activeChatId,
    createNewChat,
    setActiveChatId,
    deleteChat,
    isLoadingChats,
  } = useChat();

  const handleCreateNewChat = async () => {
    await createNewChat();
  };

  const sortedChats = React.useMemo(() => {
    return [...chats].sort((a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime());
  }, [chats]);

  return (
    <Sidebar
      variant="sidebar" 
      collapsible="icon" 
      className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-lg transition-all duration-300 ease-in-out"
    >
      <SidebarHeader className="p-3"> {/* Removed border-b border-sidebar-border */}
        <Button
          onClick={handleCreateNewChat}
          variant="ghost"
          className="w-full h-auto py-2.5 px-2 flex items-center justify-start space-x-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group"
          aria-label="New Chat"
        >
          <BrainCircuit className="h-7 w-7 text-sidebar-primary group-hover:text-sidebar-accent-foreground transition-colors shrink-0" />
          <span className="text-lg font-semibold group-data-[state=expanded]:opacity-100 group-data-[state=collapsed]:opacity-0 transition-opacity duration-200">
            New Chat
          </span>
        </Button>
      </SidebarHeader>
      <SidebarContent className="flex-grow p-0">
        <ScrollArea className="h-full">
          {isLoadingChats ? (
            <div className="flex justify-center items-center h-full p-4">
              <Loader2 className="h-8 w-8 animate-spin text-sidebar-primary" />
            </div>
          ) : sortedChats.length === 0 ? (
            <div className="p-4 text-center text-sidebar-foreground/70 group-data-[state=expanded]:opacity-100 group-data-[state=collapsed]:opacity-0 transition-opacity duration-200">
              <MessageSquare className="mx-auto h-10 w-10 mb-2 opacity-50" />
              No chats yet. <br />
              Start a new one!
            </div>
          ) : (
            <SidebarMenu className="p-2 space-y-1">
              {sortedChats.map((chat: Chat) => (
                <SidebarMenuItem key={chat.id} className="relative group/item">
                  <SidebarMenuButton
                    onClick={() => setActiveChatId(chat.id)}
                    isActive={activeChatId === chat.id}
                    className={cn(
                      "w-full justify-start text-sm h-auto py-2.5 px-3 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:py-3 group-data-[state=collapsed]:px-0",
                      activeChatId === chat.id
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground',
                    )}
                    tooltip={{
                      children: chat.title,
                      side: "right",
                      align: "center",
                      className: "ml-2" 
                    }}
                  >
                    <MessageSquare className="h-5 w-5 shrink-0 group-data-[state=collapsed]:h-6 group-data-[state=collapsed]:w-6" />
                    <span className="truncate group-data-[state=expanded]:opacity-100 group-data-[state=collapsed]:hidden transition-opacity duration-200 flex-1 text-left ml-2">
                      {chat.title}
                    </span>
                  </SidebarMenuButton>
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 group-data-[state=expanded]:opacity-100 group-data-[state=collapsed]:hidden group-hover/item:opacity-100 md:opacity-0 focus-within:opacity-100 transition-opacity duration-200">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => e.stopPropagation()} 
                          aria-label={`Delete chat ${chat.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the chat "{chat.title}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteChat(chat.id);
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          )}
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
