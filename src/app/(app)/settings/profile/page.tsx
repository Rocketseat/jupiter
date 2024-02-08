import { Metadata } from 'next'
import Image from 'next/image'

import { auth } from '@/auth'
import { Avatar } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'Profile settings',
}

export default async function ProfilePage() {
  const session = await auth()

  if (!session) {
    throw new Error('Invalid session data.')
  }

  const { user } = session

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your profile information.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="inline-block space-y-2">
            <Label>Avatar</Label>
            <Avatar className="size-16 overflow-visible">
              {user.image ? (
                <Image
                  className="aspect-square size-full rounded-full ring-1 ring-muted"
                  src={user.image}
                  width={64}
                  height={64}
                  alt=""
                />
              ) : (
                <div className="aspect-square size-full bg-accent" />
              )}
            </Avatar>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              name="name"
              id="name"
              defaultValue={user.name ?? ''}
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              type="email"
              id="email"
              defaultValue={user.email ?? ''}
              disabled
            />
          </div>
          <Separator />
          <p className="text-[0.8rem] text-muted-foreground">
            You cannot update your profile yet.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
