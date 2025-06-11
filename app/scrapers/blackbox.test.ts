/**
 * @fileoverview Tests for BlackBox AI scraper
 * @author NB Team
 */

import { blackboxAi } from './blackbox';

describe('BlackBox AI Scraper', () => {
  describe('Input Validation', () => {
    it('should reject empty query', async () => {
      const result = await blackboxAi('');
      expect(result).toBeErrorScraperResponse();
      expect(result.error).toContain('empty');
    });

    it('should reject whitespace-only query', async () => {
      const result = await blackboxAi('   ');
      expect(result).toBeErrorScraperResponse();
      expect(result.error).toContain('empty');
    });

    it('should reject extremely long query', async () => {
      const longQuery = 'a'.repeat(10001);
      const result = await blackboxAi(longQuery);
      expect(result).toBeErrorScraperResponse();
      expect(result.error).toContain('too long');
    });
  });

  describe('Successful Responses', () => {
    it('should handle simple query', async () => {
      const result = await blackboxAi('What is 2+2?');
      expect(result).toBeValidScraperResponse();
      
      if (result.status) {
        expect(result.data).toBeDefined();
        expect(typeof result.data.response).toBe('string');
        expect(Array.isArray(result.data.source)).toBe(true);
      }
    }, 15000);

    it('should handle query with special characters', async () => {
      const result = await blackboxAi('What is "Hello World" in programming?');
      expect(result).toBeValidScraperResponse();
    }, 15000);
  });

  describe('Options Handling', () => {
    it('should accept custom options', async () => {
      const result = await blackboxAi('Test query', {
        maxTokens: 512,
        webSearchMode: true,
        timeout: 10000
      });
      expect(result).toBeValidScraperResponse();
    }, 15000);
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const result = await blackboxAi('Test', {
        timeout: 1 // Very short timeout to trigger error
      });
      expect(result).toBeValidScraperResponse();
      // Should either succeed or fail gracefully
    });
  });
});