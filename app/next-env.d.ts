/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/types/routes.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.

import "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user: User & {
      role?: string;
    };
  }
}
