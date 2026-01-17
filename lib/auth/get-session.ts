import { verifySession } from './session'

export async function getSession() {
  return await verifySession()
}

