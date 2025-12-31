// Reuse the central axios instance from `src/services/api.js`
import { api as mainApi } from './api';

// Export the shared axios instance so other modules can import from this file if they expect `api.sugestao.js`.
export const api = mainApi;