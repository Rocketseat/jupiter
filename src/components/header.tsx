import { PlusCircledIcon } from '@radix-ui/react-icons'
import Image from 'next/image'
import Link from 'next/link'

import nivoIcon from '@/assets/nivo-icon.svg'

import { NavLink } from './nav-link'
import { Search } from './search'
import { ThemeSwitcher } from './theme-switcher'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { UserProfileButton } from './user-profile-button'

export function Header() {
  return (
    <div className="border-b">
      <div className="flex items-center justify-between px-8">
        <div className="flex items-center space-x-4">
          <Image
            src={nivoIcon}
            alt="Nivo"
            className="size-6"
            width={24}
            height={24}
          />

          <Separator orientation="vertical" className="h-6" />

          <nav className="flex items-center space-x-2 lg:space-x-3">
            <NavLink href="/">Dashboard</NavLink>
            <NavLink href="/uploads">Uploads</NavLink>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <Search />

          <Separator orientation="vertical" className="h-6" />

          <Button size="sm" asChild>
            <Link href="/upload">
              <PlusCircledIcon className="mr-2 h-4 w-4" />
              Upload
            </Link>
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <ThemeSwitcher />
          <UserProfileButton />
        </div>
      </div>
    </div>
  )
}
