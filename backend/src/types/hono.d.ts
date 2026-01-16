import type { JWTPayload } from './index';

type Variables = {
  user: JWTPayload;
};

type Bindings = {
  // Add any bindings here if needed
};

export type AppType = {
  Variables: Variables;
  Bindings: Bindings;
};