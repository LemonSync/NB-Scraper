// app/scrapers/apkpure.ts

/**
 * Scrape APK Pure
 */

import cloudscraper from 'cloudscraper';
import type {
    NBScraperResponse,
    ApkPureSearchOptions,
    ApkPureSearchResultItem,
    ScraperErrorType
} from '../types';
import {
    createErrorResponse,
    createSuccessResponse,
    validateRequiredParams
} from '../utils';

/**
 * Searches for APKs on APKPure.
 * Note: This scraper uses 'cloudscraper' to bypass Cloudflare protection.
 * @param options - The search options, including keyword and limit.
 * @returns A promise that resolves to the search results.
 * @example
 * ```typescript
 * import { searchApk } from 'nb-scraper';
 *
 * async function findApk() {
 * const result = await searchApk({ keyword: 'WhatsApp', limit: 5 });
 *
 * if (result.status && result.data) {
 * result.data.forEach(app => {
 * console.log(`Title: ${app.title}`);
 * console.log(`Package: ${app.packageName}`);
 * console.log(`Download: ${app.downloadUrlFile}`);
 * console.log('---');
 * });
 * } else {
 * console.error(result.error);
 * }
 * }
 *
 * findApk();
 * ```
 * @author FongsiDev
 */
export async function searchApk(
    options: ApkPureSearchOptions
): Promise<NBScraperResponse<ApkPureSearchResultItem[]>> {
    try {
        validateRequiredParams(options, ['keyword']);
        const { keyword, limit = 20 } = options;
        const url = `https://apkpure.com/api/v1/search_suggestion_new?key=${encodeURIComponent(keyword)}&limit=${limit}`;

        const response: string = await cloudscraper.get(url);
        const results = JSON.parse(response) as any[];

        const processedResults = results
            .map((item: any) => {
                if (!item?.packageName) return null;
                return {
                    ...item,
                    downloadUrlFile: `https://d.apkpure.com/b/APK/${item.packageName}?version=latest`,
                };
            })
            .filter(Boolean) as ApkPureSearchResultItem[];

        return createSuccessResponse(processedResults);

    } catch (error) {
        return createErrorResponse(error as Error, {
            type: ScraperErrorType.API_ERROR,
            context: { service: 'APKPure' }
        });
    }
}