"use client";

import {
  SignOutButton,
  useUser,
  useAuth,
} from "@clerk/nextjs";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  User, 
  Settings, 
  BookOpen, 
  LogOut, 
  Briefcase, 
  Heart, 
  MessageSquare 
} from "lucide-react";

export function UserMenu() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  
  if (!isSignedIn || !user) {
    return null;
  }

  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-purple-200 hover:border-purple-400 transition-all duration-300">
            {user.imageUrl ? (
              <AvatarImage src={user.imageUrl} alt={user.fullName || "User"} />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-purple-100 to-pink-100 text-purple-800">
                {initials || "U"}
              </AvatarFallback>
            )}
            <span className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64 p-2 rounded-xl shadow-xl border border-gray-100" align="end" forceMount>
        <div className="flex items-center gap-3 p-3">
          <Avatar className="h-10 w-10 border-2 border-purple-200">
            {user.imageUrl ? (
              <AvatarImage src={user.imageUrl} alt={user.fullName || "User"} />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-purple-100 to-pink-100 text-purple-800">
                {initials || "U"}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-medium leading-none">{user.fullName}</p>
            <p className="text-xs text-gray-500 mt-1">
              {user.primaryEmailAddress?.emailAddress}
            </p>
            <Link 
              href="/profile" 
              className="text-xs mt-1 text-purple-600 hover:text-purple-800 hover:underline font-medium"
            >
              View profile
            </Link>
          </div>
        </div>
        
        <DropdownMenuSeparator className="my-1 bg-gray-100" />
        
        <DropdownMenuGroup className="p-1">
          <DropdownMenuItem asChild className="rounded-lg py-2 cursor-pointer">
            <Link href="/profile" className="flex items-center">
              <User className="mr-3 h-4 w-4" />
              <span>My Profile</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild className="rounded-lg py-2 cursor-pointer">
            <Link href="/profile/jobs" className="flex items-center">
              <Briefcase className="mr-3 h-4 w-4" />
              <span>Job Applications</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild className="rounded-lg py-2 cursor-pointer">
            <Link href="/profile/favorites" className="flex items-center">
              <Heart className="mr-3 h-4 w-4" />
              <span>Saved Opportunities</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild className="rounded-lg py-2 cursor-pointer">
            <Link href="/profile/messages" className="flex items-center">
              <MessageSquare className="mr-3 h-4 w-4" />
              <span>Messages</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator className="my-1 bg-gray-100" />
        
        <DropdownMenuGroup className="p-1">
          <DropdownMenuItem asChild className="rounded-lg py-2 cursor-pointer">
            <Link href="/profile/settings" className="flex items-center">
              <Settings className="mr-3 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild className="rounded-lg py-2 cursor-pointer">
            <Link href="/resources" className="flex items-center">
              <BookOpen className="mr-3 h-4 w-4" />
              <span>Learning Resources</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator className="my-1 bg-gray-100" />
        
        <div className="p-1">
          <DropdownMenuItem asChild className="rounded-lg py-2 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50">
            <SignOutButton>
              <div className="flex items-center w-full">
                <LogOut className="mr-3 h-4 w-4" />
                <span>Sign out</span>
              </div>
            </SignOutButton>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 