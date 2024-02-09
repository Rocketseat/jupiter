import { ReactNode } from 'react'

import { AsideLink } from './aside-link'

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight">Settings</h2>

      <div className="grid grid-cols-5 gap-12">
        <aside className="-mx-4">
          <nav className="flex flex-col gap-1">
            <AsideLink href="/settings/profile">Profile</AsideLink>
            <AsideLink href="/settings/organization">Organization</AsideLink>
            <AsideLink href="/settings/developers">Developers</AsideLink>
          </nav>
        </aside>

        <div className="col-span-4">{children}</div>
      </div>
    </>
  )
}
