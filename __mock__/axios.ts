/**
 * @fileoverview Mock implementation of axios for testing
 */

export const mockAxiosResponse = (status: number, data: any) => ({
  status,
  data,
  statusText: status === 200 ? 'OK' : 'ERROR',
  headers: {},
  config: {},
});

export default {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
};
