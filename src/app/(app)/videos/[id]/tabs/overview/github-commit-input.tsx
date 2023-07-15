'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GitHubLogoIcon } from '@radix-ui/react-icons'

export function GithubCommitInput() {
  return (
    <div className="flex items-center gap-2">
      <Input id="commit" className="flex-1" />
      <Button variant="secondary">
        <GitHubLogoIcon className="mr-2 h-3 w-3" />
        Connect Repository
      </Button>
    </div>
  )
}
