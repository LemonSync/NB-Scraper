/**
 * NB Scraper - Community scraper library by Er Rickow
 * 
 * @packageDocumentation
 * @since 1.1.0
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
	AnimeIndoAPI,
	AnimeIndoDetail,
	AnimeIndoDownloadInfo,
	AnimeIndoEpisode,
	AnimeIndoSearchResult,
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
  DeepInfraAIData,
  DeepInfraAIOptions,
  DeepInfraAIMessage,
  DeepInfraAIModel,
  DeepInfraAIRequest,
  DeepInfraAIResponse,
	ThreadsMediaData,
	ThreadsOptions,
	FacebookDownloaderAPI,
	FacebookDownloadLink,
	FacebookVideoData,
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