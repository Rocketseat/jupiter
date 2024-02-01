import { AdapterUser as AdapterUserBase } from '@auth/core/adapters'

declare module '@auth/core/adapters' {
  interface AdapterUser extends AdapterUserBase {
    companyId: string
  }
}
