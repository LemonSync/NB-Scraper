/**
 * @fileoverview NB Scraper - Community scraper library by Er Rickow 
 * @author ErRickow
 * @version 1.1.0
 * @license The Unlicense
 * 
 * @description
 * A comprehensive TypeScript scraper library that provides easy-to-use functions
 * for scraping various online services and APIs. Built with type safety,
 * error handling, and maintainability in mind.
 * 
 * @example
 * ```typescript
 * import { blackboxAi, threads } from 'nb-scraper';
 * 
 * // Scrape BlackBox AI
 * const aiResult = await blackboxAi('What is TypeScript?');
 * if (aiResult.status) {
 *   console.log(aiResult.data.response);
 * }
 * 
 * // Scrape Threads media
 * const mediaResult = await threads('https://www.threads.net/@user/post/123');
 * if (mediaResult.status) {
 *   console.log(mediaResult.data.image_urls);
 * }
 * ```
 */

// Export all scrapers
export * from './scrapers/index';

// Export types
export type {
	NBScraperResponse,
	NBScraperConfig,
	RequestConfig,
	ScraperError,
	ScraperErrorType,
	BlackBoxAIData,
	BlackBoxAIOptions,
	BlackBoxSource,
	ExomlAPIMessage,
	ExomlAPIOptions,
	ExomlAPIData,
	ExomlAPIRandomData,
	PollinationsOptions,
	PollinationsData,
	SoundCloudTrack,
	SoundCloudSearchOptions,
	SoundCloudData,
	SoundCloudCache,
	DreamAnalysisOptions,
	DreamAnalysisData,
	ThreadsMediaData,
	ThreadsOptions,
	PinterestData
} from './types';

// Export utilities (for advanced users)
export {
	createErrorResponse,
	createSuccessResponse,
	isValidUrl,
	sanitizeString,
	extractDomain,
	formatBytes,
	DEFAULT_CONFIG,
	CREATOR
} from './utils';

/**
 * Library version
 * @public
 */
export const VERSION = '1.2.0';

/**
 * Library information
 * @public
 */
export const INFO = {
	name: 'nb-scraper',
	version: VERSION,
	author: 'Er Rickow',
	description: 'NB Community scraper library',
	repository: 'https://github.com/chakszzz/nb-scraper',
	documentation: 'https://chakszzz.github.io/nb-scraper'
} as const;