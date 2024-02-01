import { LogOut } from 'lucide-react'
import Image from 'next/image'

import { auth, signOut } from '@/auth'

import { Avatar } from './ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

export async function UserProfileButton() {
  const session = await auth()

  async function handleSignOut() {
    'use server'

    await signOut()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer" asChild>
        <Avatar>
          {session?.user && session?.user.image ? (
            <Image
              className="aspect-square h-full w-full"
              src={session.user.image}
              width={48}
              height={48}
              alt=""
            />
          ) : (
            <div className="aspect-square h-full w-full bg-accent" />
          )}
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <form action={handleSignOut}>
          <DropdownMenuItem className="flex items-center gap-2" asChild>
            <button type="submit" className="w-full">
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
