
'use client';

import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  // SidebarFooter, // Removed as per user request to remove footer
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { MessageSquare, Trash2, Loader2, BrainCircuit, Wrench, Images } from 'lucide-react'; // Added Images
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
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // To highlight active link & for navigation

const AppSidebar: React.FC = () => {
  const {
    chats,
    activeChatId,
    createNewChat,
    setActiveChatId,
    deleteChat,
    isLoadingChats,
  } = useChat();
  const pathname = usePathname(); // Get current path
  const router = useRouter(); // Get router instance

  const handleCreateNewChat = async () => {
    const newChatId = await createNewChat(); // This will set the new chat active
    if (pathname !== '/') {
      router.push('/');
    }
    // setActiveChatId is handled by createNewChat
  };

  const sortedChats = React.useMemo(() => {
    return [...chats].sort((a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime());
  }, [chats]);

  const currentYear = new Date().getFullYear();

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="border-r-0 bg-sidebar text-sidebar-foreground shadow-lg transition-all duration-300 ease-in-out"
    >
      <SidebarHeader className="p-0 h-auto flex items-center border-b-0">
        <Button
          onClick={handleCreateNewChat}
          variant="ghost"
          className="w-full h-16 py-2 px-3 flex items-center justify-start space-x-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group rounded-none"
          aria-label="New Chat"
        >
          <BrainCircuit className="h-7 w-7 text-sidebar-primary group-hover:text-sidebar-accent-foreground transition-colors shrink-0 ml-1" />
          <span className="text-lg font-semibold group-data-[state=expanded]:opacity-100 group-data-[state=collapsed]:opacity-0 transition-opacity duration-200">
            Enyi
          </span>
        </Button>
      </SidebarHeader>
      <SidebarContent className="flex-grow p-0">
        <ScrollArea className="h-full">
          {isLoadingChats ? (
            <div className="flex justify-center items-center h-full p-4">
              <Loader2 className="h-8 w-8 animate-spin text-sidebar-primary" />
            </div>
          ) : (
            <>
              <SidebarMenu className="p-2 space-y-1">
                 <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname === '/tools'} // Highlight if active
                        className={cn(
                        "w-full justify-start text-sm h-auto py-2.5 px-3 rounded-md group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:py-3 group-data-[state=collapsed]:px-0",
                         pathname === '/tools'
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm'
                            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        )}
                         tooltip={{
                            children: "Tools",
                            side: "right",
                            align: "center",
                            className: "ml-2"
                        }}
                    >
                        <Link href="/tools">
                            <Wrench className="h-5 w-5 shrink-0 group-data-[state=collapsed]:h-6 group-data-[state=collapsed]:w-6" />
                            <span className="truncate group-data-[state=expanded]:opacity-100 group-data-[state=collapsed]:hidden transition-opacity duration-200 flex-1 text-left ml-2.5">
                                Tools
                            </span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname === '/image-history'} // Highlight if active
                        className={cn(
                        "w-full justify-start text-sm h-auto py-2.5 px-3 rounded-md group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:py-3 group-data-[state=collapsed]:px-0",
                         pathname === '/image-history'
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm'
                            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        )}
                         tooltip={{
                            children: "Image History",
                            side: "right",
                            align: "center",
                            className: "ml-2"
                        }}
                    >
                        <Link href="/image-history">
                            <Images className="h-5 w-5 shrink-0 group-data-[state=collapsed]:h-6 group-data-[state=collapsed]:w-6" />
                            <span className="truncate group-data-[state=expanded]:opacity-100 group-data-[state=collapsed]:hidden transition-opacity duration-200 flex-1 text-left ml-2.5">
                                Image History
                            </span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
              {sortedChats.length === 0 && !isLoadingChats && (
                 pathname === '/' && // Only show "No chats yet" if on the main chat page
                <div className="p-4 pt-8 text-center text-sidebar-foreground/60 group-data-[state=expanded]:opacity-100 group-data-[state=collapsed]:opacity-0 transition-opacity duration-200">
                  <MessageSquare className="mx-auto h-12 w-12 mb-3 opacity-40" />
                  No chats yet. <br />
                  Start a new one!
                </div>
              )}
              {sortedChats.length > 0 && (
                 <SidebarMenu className="p-2 space-y-1">
                  <div className="px-3 pt-2 pb-1 group-data-[state=expanded]:opacity-100 group-data-[state=collapsed]:opacity-0 transition-opacity duration-200">
                    <p className="text-xs font-medium text-sidebar-foreground/60">Chat History</p>
                  </div>
                  {sortedChats.map((chat: Chat) => (
                    <SidebarMenuItem key={chat.id} className="relative group/item">
                      <SidebarMenuButton
                        onClick={() => {
                           if (pathname !== '/') {
                             router.push('/');
                           }
                           setActiveChatId(chat.id);
                        }}
                        isActive={activeChatId === chat.id && pathname === '/'} // Only active if on main page and chat matches
                        className={cn(
                          "w-full justify-start text-sm h-auto py-2.5 px-3 rounded-md group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:py-3 group-data-[state=collapsed]:px-0",
                          activeChatId === chat.id && pathname === '/'
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm'
                            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        )}
                        tooltip={{
                          children: chat.title,
                          side: "right",
                          align: "center",
                          className: "ml-2"
                        }}
                      >
                        <MessageSquare className="h-5 w-5 shrink-0 group-data-[state=collapsed]:h-6 group-data-[state=collapsed]:w-6" />
                        <span className="truncate group-data-[state=expanded]:opacity-100 group-data-[state=collapsed]:hidden transition-opacity duration-200 flex-1 text-left ml-2.5">
                          {chat.title}
                        </span>
                      </SidebarMenuButton>
                      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 group-data-[state=expanded]:opacity-100 group-data-[state=collapsed]:hidden group-hover/item:opacity-100 md:opacity-0 focus-within:opacity-100 transition-opacity duration-200">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded-md"
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
            </>
          )}
        </ScrollArea>
      </SidebarContent>
      <div className="p-3 border-t border-sidebar-border mt-auto">
        <div className="text-xs text-sidebar-foreground/60 text-center group-data-[state=expanded]:opacity-100 group-data-[state=collapsed]:opacity-0 transition-opacity duration-200">
          Enyi AI &copy; {currentYear}
        </div>
      </div>
    </Sidebar>
  );
};

export default AppSidebar;

