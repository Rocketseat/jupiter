import { Metadata } from 'next'
import { unstable_noStore } from 'next/cache'
import Image from 'next/image'

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
import { Select, SelectTrigger } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { serverClient } from '@/lib/trpc/server'

export const metadata: Metadata = {
  title: 'Organization settings',
}

export default async function OrganizationPage() {
  unstable_noStore()

  const { company } = await serverClient.getCurrentUserCompany()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization</CardTitle>
        <CardDescription>Update your organization information.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              name="name"
              id="name"
              defaultValue={company.name ?? ''}
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <Input
              type="text"
              id="domain"
              defaultValue={company.domain ?? ''}
              disabled
            />
            <p className="text-[0.8rem] text-muted-foreground">
              All users that authenticate with this domain will automatically
              join your organization.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Members</Label>
            <div className="rounded border">
              <Table>
                <TableBody>
                  {company.members.map((member) => {
                    return (
                      <TableRow key={member.id}>
                        <TableCell style={{ width: 48 }}>
                          <Avatar>
                            {member.image ? (
                              <Image
                                className="aspect-square size-full"
                                src={member.image}
                                width={32}
                                height={32}
                                alt=""
                              />
                            ) : (
                              <div className="aspect-square size-full bg-accent" />
                            )}
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-primary">
                              {member.name}
                            </span>

                            <span className="text-xs text-muted-foreground">
                              {member.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell style={{ width: 160 }}>
                          <Select disabled>
                            <SelectTrigger>Admin</SelectTrigger>
                          </Select>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          <Separator />

          <p className="text-[0.8rem] text-muted-foreground">
            You cannot update your organization profile yet.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
