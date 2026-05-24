// Note: the `PrivateService` is only available when generating the client
// for local environments.
import { OpenAPI } from "../../src/client"

OpenAPI.BASE = `${process.env.VITE_API_URL}`

export async function createUser(_opts: {
  email: string
  password: string
}): Promise<{ full_name: string }> {
  // eslint-disable-next-line no-throw-literal
  return Promise.reject(new Error("PrivateService not available in this build"))
}
