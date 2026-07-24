import { setupServer } from 'msw/node';

import { handlers } from './handlers';

/** MSW server for Node-based unit tests. */
export const server = setupServer(...handlers);
