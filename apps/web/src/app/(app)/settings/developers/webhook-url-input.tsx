import { auth } from '@nivo/auth'
import { db } from '@nivo/drizzle'
import { company } from '@nivo/drizzle/schema'
import { eq } from 'drizzle-orm'
import { PlugZap, X } from 'lucide-react'
import { revalidateTag, unstable_cache } from 'next/cache'

import { Button } from '@/components/ui/button'

const getWebhookUrl = unstable_cache(
  async (companyId: string) => {
    const company = await db.query.company.findFirst({
      columns: {
        webhookUrl: true,
      },
      where(fields, { eq }) {
        return eq(fields.id, companyId)
      },
    })

    if (!company) {
      throw new Error('Company not found.')
    }

    return company.webhookUrl
  },
  ['webhook-url'],
  {
    tags: ['webhook-url'],
  },
)

export async function WebhookUrlInput() {
  const session = await auth()

  if (!session || !session.user) {
    throw new Error('Session not available.')
  }

  const webhookUrl = await getWebhookUrl(session.user.companyId)

  async function handleConnectWebhook(formData: FormData) {
    'use server'

    const url = formData.get('url')?.toString()

    if (!url) {
      return
    }

    if (!session) {
      throw new Error('No session available')
    }

    await db
      .update(company)
      .set({
        webhookUrl: url,
      })
      .where(eq(company.id, session.user.companyId))

    revalidateTag('webhook-url')
  }

  async function handleDisconnectWebhook() {
    'use server'

    if (!session) {
      throw new Error('No session available')
    }

    await db
      .update(company)
      .set({
        webhookUrl: null,
      })
      .where(eq(company.id, session.user.companyId))

    revalidateTag('webhook-url')
  }

  const hasWebhookUrl = !!webhookUrl

  return (
    <form
      action={handleConnectWebhook}
      className="flex h-10 items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-slate-400 has-[input:focus-visible]:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:has-[input:focus-visible]:ring-slate-800"
    >
      <input
        defaultValue={webhookUrl ?? ''}
        name="url"
        id="webhookUrl"
        className="flex-1 bg-transparent py-2 text-sm outline-none disabled:opacity-50"
        disabled={hasWebhookUrl}
      />

      {hasWebhookUrl ? (
        <Button
          type="submit"
          formAction={handleDisconnectWebhook}
          size="xs"
          variant="secondary"
        >
          <X className="mr-1.5 size-3" />
          Remove
        </Button>
      ) : (
        <Button type="submit" size="xs">
          <PlugZap className="mr-1.5 size-3" />
          Connect
        </Button>
      )}
    </form>
  )
}
