/**
 * @fileoverview DreamAnalysis - Dream Interpretation Service
 * Base URL: https://safe-coast-53976-cd772af9b056.herokuapp.com/
 * 
 * Features:
 * - Analyze and interpret dreams from text descriptions
 * - Premium analysis features available
 * - Returns detailed interpretation with symbols, emotions, and themes
 * 
 * @author NB Team
 * @version 1.0.0
 */

import {
  NBScraperResponse,
  DreamAnalysisData,
  DreamAnalysisOptions,
  ScraperErrorType
} from '../types';
import {
  createErrorResponse,
  createSuccessResponse,
  makeRequest,
  validateRequiredParams
} from '../utils';

const BASE_URL = 'https://safe-coast-53976-cd772af9b056.herokuapp.com/';

/**
 * Analyze dream text and get interpretation
 * 
 * @example
 * ```typescript
 * import { analyzeDream } from 'nb-scraper';
 * 
 * const result = await analyzeDream({
 *   text: "I dreamed I was flying over mountains",
 *   isPremium: true
 * });
 * 
 * if (result.status) {
 *   console.log(result.data.interpretation);
 * }
 * ```
 * 
 * @param options - Configuration for dream analysis
 * @returns Promise<NBScraperResponse<DreamAnalysisData>>
 */
export async function analyzeDream(
  options: DreamAnalysisOptions
): Promise < NBScraperResponse < DreamAnalysisData >> {
  try {
    validateRequiredParams(options, ['text']);
    
    const { text, isPremium = true } = options;
    
    const response = await makeRequest({
      url: BASE_URL,
      method: 'POST',
      headers: {
        'Accept-Encoding': 'gzip',
        'Connection': 'Keep-Alive',
        'Content-Type': 'application/json',
        'Host': 'safe-coast-53976-cd772af9b056.herokuapp.com',
        'User-Agent': 'okhttp/4.9.2'
      },
      body: JSON.stringify({ text, isPremium })
    });
    
    return createSuccessResponse < DreamAnalysisData > (response.data);
  } catch (error) {
    return createErrorResponse(error as Error, {
      type: ScraperErrorType.API_ERROR,
      context: { service: 'DreamAnalysis' }
    });
  }
}

/**
 * Quick analysis with basic interpretation
 * 
 * @example
 * ```typescript
 * import { quickDreamAnalysis } from 'nb-scraper';
 * 
 * const result = await quickDreamAnalysis("I dreamed of being chased");
 * if (result.status) {
 *   console.log(result.data);
 * }
 * ```
 * 
 * @param text - Dream description text
 * @returns Promise<NBScraperResponse<DreamAnalysisData>>
 */
export async function quickDreamAnalysis(
  text: string
): Promise < NBScraperResponse < DreamAnalysisData >> {
  return analyzeDream({ text, isPremium: false });
}

/**
 * Premium analysis with detailed interpretation
 * 
 * @example
 * ```typescript
 * import { premiumDreamAnalysis } from 'nb-scraper';
 * 
 * const result = await premiumDreamAnalysis("I dreamed I could breathe underwater");
 * if (result.status) {
 *   console.log(result.data.symbols);
 * }
 * ```
 * 
 * @param text - Dream description text
 * @returns Promise<NBScraperResponse<DreamAnalysisData>>
 */
export async function premiumDreamAnalysis(
  text: string
): Promise < NBScraperResponse < DreamAnalysisData >> {
  return analyzeDream({ text, isPremium: true });
}