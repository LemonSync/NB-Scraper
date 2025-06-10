/**
 * @fileoverview Type definitions for NB Scraper
 * @author ErRickow
 * @version 1.1.0
 */

/**
 * Standard response structure for all scraper functions
 * @template T - The type of the data property
 */
export interface NBScraperResponse<T = unknown> {
  /** The creator/author of this scraper */
  creator: string;
  /** Whether the operation was successful */
  status: boolean;
  /** The scraped data (only present when status is true) */
  data?: T;
  /** Error message (only present when status is false) */
  error?: string;
}

/**
 * Configuration options for HTTP requests
 */
export interface RequestConfig {
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Custom headers to include in the request */
  headers?: Record<string, string>;
  /** Maximum number of retry attempts */
  retries?: number;
  /** Delay between retry attempts in milliseconds */
  retryDelay?: number;
}

/**
 * Error types that can occur during scraping
 */
export enum ScraperErrorType {
  /** Network-related errors (connection, timeout, etc.) */
  NETWORK_ERROR = 'NETWORK_ERROR',
  /** Invalid or malformed input parameters */
  INVALID_INPUT = 'INVALID_INPUT',
  /** API returned an unexpected response format */
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  /** Rate limiting or quota exceeded */
  RATE_LIMITED = 'RATE_LIMITED',
  /** Service is temporarily unavailable */
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  /** Authentication or authorization failed */
  AUTH_ERROR = 'AUTH_ERROR',
  /** Error parsing response data */
  PARSE_ERROR = 'PARSE_ERROR',
  /** Error during image generation */
  IMAGE_GENERATION_ERROR = 'IMAGE_GENERATION_ERROR',
  /** Error calling external API */
  API_ERROR = 'API_ERROR',
  /** Unknown or unexpected error */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Detailed error information
 */
export interface ScraperError {
  /** The type of error that occurred */
  type: ScraperErrorType;
  /** Human-readable error message */
  message: string;
  /** Original error object (if available) */
  originalError?: Error;
  /** Additional context about the error */
  context?: Record<string, unknown>;
}

/* ==================== Scraper-Specific Types ==================== */

/**
 * Pollinations AI Image Generation Types
 */
export interface PollinationsOptions {
  prompt: string;
  nologo?: boolean;
}

export interface PollinationsData {
  /** URL of the generated image on Catbox.moe */
  url: string;
  /** Direct Pollinations image URL */
  directUrl: string;
}

/**
 * Pinterest Scraper Types
 */
export interface PinterestData {
  /** Array of image URLs */
  result: string[];
}

/**
 * SoundCloud Scraper Types
 */
export interface SoundCloudTrack {
  id: number;
  title: string;
  url: string;
  duration: string;
  thumbnail: string | null;
  author: {
    name: string;
    url: string;
  };
  like_count: string;
  download_count: string;
  play_count: string;
  release_date: string | null;
  /** Audio quality (HQ/SQ) */
  audio_quality?: string;
  /** File size if downloadable */
  file_size?: string | null;
}

export interface SoundCloudSearchOptions {
  query: string;
  limit?: number;
}

export interface SoundCloudData {
  tracks: SoundCloudTrack[];
}

export interface SoundCloudCache {
  version: string;
  id: string;
}

/**
 * ExomlAPI AI Text Completion Types
 */
export interface ExomlAPIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ExomlAPIOptions {
  messages: ExomlAPIMessage[];
  systemPrompt?: string;
  model?: string;
}

export interface ExomlAPIData {
  content: string;
}

export interface ExomlAPIRandomData {
  id: string;
  chatId: string;
  userId: string;
  antiBotId: string;
}

/**
 * DreamAnalysis Types
 */
export interface DreamAnalysisOptions {
  text: string;
  isPremium?: boolean;
}

export interface DreamAnalysisData {
  analysis?: string;
  interpretation?: string;
  symbols?: {
    name: string;
    meaning: string;
    relevance: number;
  }[];
  emotions?: string[];
  themes?: string[];
  /** Additional metadata from analysis */
  metadata?: Record<string, unknown>;
}

/**
 * BlackBox AI Types
 */
export interface BlackBoxAIData {
  /** The AI's response text */
  response: string;
  /** Array of sources used by the AI */
  source: BlackBoxSource[];
}

export interface BlackBoxSource {
  /** URL of the source */
  link: string;
  /** Title of the source */
  title: string;
  /** Text snippet from the source */
  snippet: string;
  /** Position/ranking of the source */
  position: number;
}

export interface BlackBoxAIOptions extends RequestConfig {
  /** Maximum number of tokens in the response */
  maxTokens?: number;
  /** Temperature for response generation (0-1) */
  temperature?: number;
  /** Whether to enable web search mode */
  webSearchMode?: boolean;
  /** Whether to enable memory/context */
  memoryEnabled?: boolean;
}

/**
 * Threads Scraper Types
 */
export interface ThreadsMediaData {
  /** Array of image URLs */
  image_urls: string[];
  /** Array of video URLs */
  video_urls: string[];
}

export interface ThreadsOptions extends RequestConfig {
  /** Whether to include only images */
  imagesOnly?: boolean;
  /** Whether to include only videos */
  videosOnly?: boolean;
}

/**
 * Global configuration for the scraper library
 */
export interface NBScraperConfig {
  /** Default timeout for all requests */
  defaultTimeout: number;
  /** Default number of retries */
  defaultRetries: number;
  /** Default retry delay */
  defaultRetryDelay: number;
  /** Whether to log detailed error information */
  verboseErrors: boolean;
  /** Custom user agent string */
  userAgent: string;
}