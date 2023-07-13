import { Button } from '@/components/ui/button'
import { ArrowRightIcon } from '@radix-ui/react-icons'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.',
}

export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full max-w-[350px] flex-col justify-center space-y-6">
        <div className="flex flex-col items-center space-y-8">
          <svg
            width="24"
            height="28"
            viewBox="0 0 24 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M23.237 0.54448L19.5763 0.00573221C19.468 -0.0158177 19.3597 0.0272795 19.3164 0.0703793L17.7568 2.09607C17.6485 2.22537 17.6269 2.39777 17.6702 2.54862C17.7135 2.69947 17.5835 2.82877 17.4319 2.80722L16.1539 2.52707C15.959 2.48397 15.7424 2.54862 15.6124 2.72102L10.5438 9.18599C10.4571 9.31529 10.2838 9.35839 10.1322 9.29374L8.20439 8.43174C8.0311 8.34554 7.83615 8.36709 7.68453 8.47484L6.70979 9.14289C6.55816 9.25064 6.34155 9.27219 6.16827 9.18599L5.69173 8.94894C5.38848 8.79809 5.02024 8.97049 4.9336 9.29374L4.58702 10.8238C4.50038 11.1901 4.65201 11.5565 4.97692 11.7504L5.71339 12.203L8.07442 13.6468L9.22245 14.358C9.54736 14.5519 9.95892 14.5088 10.2405 14.2718L12.1683 12.5909C12.32 12.4616 12.5582 12.4185 12.7315 12.5262L13.3163 12.8279C13.5113 12.9357 13.7496 12.8926 13.9012 12.7417L14.8759 11.8366C15.0276 11.6858 15.2658 11.6642 15.4391 11.7504L16.8904 12.4185C17.107 12.5262 17.3669 12.4616 17.5186 12.2676L18.19 11.4056L23.2803 4.91911C23.5186 4.61741 23.367 4.16486 22.9771 4.07866L21.8507 3.82006C21.6125 3.77696 21.5042 3.47526 21.6774 3.30286L23.432 1.12632C23.6053 0.867724 23.497 0.587579 23.237 0.54448ZM6.44985 13.6037C6.34155 13.539 6.23324 13.6468 6.27657 13.7545L6.81809 15.1768C6.86141 15.2846 6.86141 15.3923 6.83975 15.5001L6.36321 17.3534C6.34155 17.4827 6.38487 17.612 6.47151 17.6766L7.83615 18.7326C7.96611 18.8188 8.1394 18.8188 8.2477 18.711L9.67732 17.4611C9.76396 17.3965 9.87227 17.3534 9.95891 17.3318L11.5835 17.1594C11.6918 17.1379 11.7351 16.987 11.6268 16.9224L6.44985 13.6037ZM5.64829 18.3447C5.75659 18.3016 5.88656 18.3232 5.9732 18.3879L7.44614 19.5084C7.51112 19.5731 7.55444 19.6593 7.55444 19.767L7.42448 21.4048C7.40282 21.491 7.38116 21.5557 7.31618 21.6203L0.969546 27.956C0.926224 28.0206 0.839579 27.956 0.882901 27.8914L2.63743 25.0252C2.65909 25.0037 2.63743 24.9606 2.61577 24.939H2.55079L1.98761 25.1545C1.94428 25.1545 1.92262 25.133 1.90096 25.1114V25.0683L4.34864 19.0559C4.39196 18.9912 4.43528 18.9266 4.50027 18.905L5.64829 18.3447Z"
              className="fill-primary"
            />
          </svg>
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Access denied!
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              It looks like an error has ocurred while you were trying to
              authenticate.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Only{' '}
              <code className="text-accent-foreground">@rocketseat.team</code>{' '}
              e-mails are allowed.
            </p>
          </div>
          <Button asChild variant="outline" type="button" className="w-full">
            <Link href="/auth/sign-in">
              Try again
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
