import { Auth0Client } from "@auth0/nextjs-auth0/server";

// Lazy initialization — Auth0 env vars may not be available at build time
// (Render builds in Docker where runtime env vars aren't present during `npm run build`)
let _auth0: Auth0Client | null = null;

export const auth0 = new Proxy({} as Auth0Client, {
  get(_target, prop) {
    if (!_auth0) {
      _auth0 = new Auth0Client();
    }
    return (_auth0 as any)[prop];
  },
});
