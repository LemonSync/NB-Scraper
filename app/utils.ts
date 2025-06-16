/**
 * @fileoverview Utility functions for NB Scraper
 * @author Er Project
 * @version 1.0.0
 */

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { NBScraperResponse, ScraperError, ScraperErrorType, RequestConfig } from './types';

/**
 * Default configuration for the scraper
 */
export const DEFAULT_CONFIG = {
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  userAgent: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
} as const;

/**
 * Creator information
 */
export const CREATOR = 'nb-scraper';

/**
 * Sleep function for delays
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after the specified time
 */
export const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Validates if a string is a valid URL
 * @param url - The URL string to validate
 * @returns True if the URL is valid, false otherwise
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitizes a string by removing potentially harmful characters
 * @param input - The input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>'"]/g, '') // Remove potential XSS characters
    .trim()
    .slice(0, 10000); // Limit length to prevent memory issues
}

/**
 * Creates a standardized error response
 * @param error - The error that occurred
 * @param context - Additional context about the error
 * @returns Standardized error response
 */
export function createErrorResponse(
  error: ScraperError | Error | string,
  context?: Record<string, unknown>
): NBScraperResponse<never> {
  let errorMessage: string;
  let errorType: ScraperErrorType = ScraperErrorType.UNKNOWN_ERROR;

  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error instanceof Error) {
    errorMessage = error.message;
    
    // Classify error type based on error properties
    if (error.name === 'AxiosError' || error.message.includes('network')) {
      errorType = ScraperErrorType.NETWORK_ERROR;
    } else if (error.message.includes('timeout')) {
      errorType = ScraperErrorType.NETWORK_ERROR;
    } else if (error.message.includes('rate') || error.message.includes('limit')) {
      errorType = ScraperErrorType.RATE_LIMITED;
    }
  } else {
    errorMessage = error.message;
    errorType = error.type;
  }

  return {
    library: CREATOR,
    status: false,
    error: `[${errorType}] ${errorMessage}${context ? ` | Context: ${JSON.stringify(context)}` : ''}`
  };
}

/**
 * Creates a standardized success response
 * @param data - The data to include in the response
 * @returns Standardized success response
 */
export function createSuccessResponse<T>(data: T): NBScraperResponse<T> {
  return {
    library: CREATOR,
    status: true,
    data
  };
}

/**
 * Makes an HTTP request with retry logic and error handling
 * @param config - Axios request configuration
 * @param options - Additional options for the request
 * @returns Promise that resolves to the response data
 */
export async function makeRequest<T = unknown>(
  config: AxiosRequestConfig,
  options: RequestConfig = {}
): Promise<AxiosResponse<T>> {
  const {
    timeout = DEFAULT_CONFIG.timeout,
    retries = DEFAULT_CONFIG.retries,
    retryDelay = DEFAULT_CONFIG.retryDelay,
    headers = {}
  } = options;

  const requestConfig: AxiosRequestConfig = {
    ...config,
    timeout,
    headers: {
      'User-Agent': DEFAULT_CONFIG.userAgent,
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
      ...headers,
      ...config.headers
    }
  };

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await axios(requestConfig);
      return response;
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on certain error types
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        // Don't retry on 4xx errors (except 429 - Too Many Requests)
        if (axiosError.response?.status && 
            axiosError.response.status >= 400 && 
            axiosError.response.status < 500 && 
            axiosError.response.status !== 429) {
          throw error;
        }
      }

      // If this is the last attempt, throw the error
      if (attempt === retries) {
        throw lastError;
      }

      // Wait before retrying
      await sleep(retryDelay * (attempt + 1)); // Exponential backoff
    }
  }

  throw lastError;
}

/**
 * Validates required parameters for scraper functions
 * @param params - Object containing parameters to validate
 * @param required - Array of required parameter names
 * @throws Error if any required parameter is missing or invalid
 */
export function validateRequiredParams(
  params: Record<string, unknown>,
  required: string[]
): void {
  for (const param of required) {
    const value = params[param];
    
    if (value === undefined || value === null || value === '') {
      throw new Error(`Parameter '${param}' is required and cannot be empty`);
    }
    
    if (typeof value === 'string' && value.trim() === '') {
      throw new Error(`Parameter '${param}' cannot be an empty string`);
    }
  }
}

/**
 * Safely parses JSON string, returning null if parsing fails
 * @param jsonString - The JSON string to parse
 * @returns Parsed object or null if parsing failed
 */
export function safeJsonParse<T = unknown>(jsonString: string): T | null {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return null;
  }
}

/**
 * Extracts domain from URL
 * @param url - The URL to extract domain from
 * @returns Domain string or null if invalid URL
 */
export function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
}

/**
 * Formats bytes to human readable format
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places
 * @returns Formatted string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}