/**
 * @fileoverview Tests for BlackBox AI scraper
 * @author From NB
 * @version 1.0.0
 */

import { blackboxAi } from '../scrapers/blackbox';
import { NBScraperResponse, BlackBoxAIData } from '../types';
import { mockAxiosResponse } from './__mocks__/axios';

// Mock the utils functions
jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  makeRequest: jest.fn(),
  validateRequiredParams: jest.fn(),
  safeJsonParse: jest.fn(),
}));

const { makeRequest, validateRequiredParams, safeJsonParse } = require('../utils');

describe('blackboxAi', () => {
  const mockSuccessResponse = (responseData: string) => {
    (makeRequest as jest.Mock).mockResolvedValueOnce(
      mockAxiosResponse(200, responseData)
    );
  };

  const mockErrorResponse = (error: Error) => {
    (makeRequest as jest.Mock).mockRejectedValueOnce(error);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (validateRequiredParams as jest.Mock).mockImplementation((params, required) => {
      if (!params.query) throw new Error('Missing required parameter: query');
    });
  });

  describe('Input validation', () => {
    it('should reject empty query', async () => {
      const result = await blackboxAi('');
      expect(result.status).toBe(false);
      expect(result.error).toContain('Query cannot be empty');
    });

    it('should reject query over 10,000 characters', async () => {
      const longQuery = 'a'.repeat(10001);
      const result = await blackboxAi(longQuery);
      expect(result.status).toBe(false);
      expect(result.error).toContain('Query too long');
    });

    it('should validate required parameters', async () => {
      // @ts-expect-error - Testing invalid input
      await expect(blackboxAi()).rejects.toThrow();
      expect(validateRequiredParams).toHaveBeenCalled();
    });
  });

  describe('Successful responses', () => {
    it('should handle simple response without sources', async () => {
      const mockResponse = "This is a test response$~~~$";
      mockSuccessResponse(mockResponse);

      const result = await blackboxAi('test query');
      expect(result.status).toBe(true);
      expect(result.data?.response).toBe("This is a test response");
      expect(result.data?.source).toEqual([]);
    });

    it('should handle response with sources', async () => {
      const sources = JSON.stringify([
        { link: 'https://example.com', title: 'Example', snippet: 'Test snippet', position: 1 }
      ]);
      const mockResponse = `$~~~$${sources}$~~~$This is a test response`;
      mockSuccessResponse(mockResponse);
      (safeJsonParse as jest.Mock).mockReturnValueOnce(JSON.parse(sources));

      const result = await blackboxAi('test query');
      expect(result.status).toBe(true);
      expect(result.data?.response).toBe("This is a test response");
      expect(result.data?.source).toEqual([
        { link: 'https://example.com', title: 'Example', snippet: 'Test snippet', position: 1 }
      ]);
    });

    it('should handle invalid sources gracefully', async () => {
      const invalidSources = "invalid json";
      const mockResponse = `$~~~$${invalidSources}$~~~$This is a test response`;
      mockSuccessResponse(mockResponse);
      (safeJsonParse as jest.Mock).mockReturnValueOnce(null);

      const result = await blackboxAi('test query');
      expect(result.status).toBe(true);
      expect(result.data?.response).toBe("This is a test response");
      expect(result.data?.source).toEqual([]);
    });
  });

  describe('Error handling', () => {
    it('should handle API errors', async () => {
      const error = new Error('API timeout');
      mockErrorResponse(error);

      const result = await blackboxAi('test query');
      expect(result.status).toBe(false);
      expect(result.error).toContain('API timeout');
    });

    it('should handle invalid response format', async () => {
      mockSuccessResponse({ invalid: 'format' });

      const result = await blackboxAi('test query');
      expect(result.status).toBe(false);
      expect(result.error).toContain('Invalid response format');
    });

    it('should handle empty response', async () => {
      mockSuccessResponse('');

      const result = await blackboxAi('test query');
      expect(result.status).toBe(false);
      expect(result.error).toContain('Failed to parse');
    });
  });

  describe('Configuration options', () => {
    it('should apply default configuration', async () => {
      const mockResponse = "Test response";
      mockSuccessResponse(mockResponse);

      await blackboxAi('test query');
      const requestConfig = (makeRequest as jest.Mock).mock.calls[0][0];

      expect(requestConfig.url).toBe('https://www.blackbox.ai/api/chat');
      expect(requestConfig.data.maxTokens).toBe(1024);
      expect(requestConfig.data.webSearchModeOption.webMode).toBe(false);
    });

    it('should override default configuration', async () => {
      const mockResponse = "Test response";
      mockSuccessResponse(mockResponse);

      await blackboxAi('test query', {
        maxTokens: 2048,
        webSearchMode: true,
        headers: { 'X-Custom': 'test' }
      });

      const requestConfig = (makeRequest as jest.Mock).mock.calls[0][0];
      expect(requestConfig.data.maxTokens).toBe(2048);
      expect(requestConfig.data.webSearchModeOption.webMode).toBe(true);
      expect(requestConfig.headers['X-Custom']).toBe('test');
    });
  });

  describe('Response parsing', () => {
    it('should parse valid sources correctly', () => {
      const sources = [
        { link: 'https://valid.com', title: 'Valid' },
        { link: 'invalid', title: 123 }, // Invalid entry
        null // Invalid entry
      ];
      const parsed = JSON.stringify(sources);
      const rawResponse = `$~~~$${parsed}$~~~$Response`;

      (safeJsonParse as jest.Mock).mockImplementationOnce(() => sources);
      const result = blackboxAi('test query');

      // Only the valid source should be included
      expect(result).resolves.toMatchObject({
        status: true,
        data: {
          response: 'Response',
          source: [{ link: 'https://valid.com', title: 'Valid', snippet: '', position: 0 }]
        }
      });
    });
  });
});
