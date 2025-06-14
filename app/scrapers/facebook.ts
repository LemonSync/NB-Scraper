import cheerio from 'cheerio';
import qs from 'qs';
import {
  NBScraperResponse,
  FacebookDownloadLink,
  FacebookVideoData,
  ScraperErrorType,
  RequestConfig
} from '../types';
import {
  createErrorResponse,
  createSuccessResponse,
  validateRequiredParams,
  makeRequest
} from '../utils';

interface VerifyResponse {
  token?: string;
  [key: string]: unknown;
}

interface AjaxResponse {
  status: string;
  data?: string;
  [key: string]: unknown;
}

/**
 * Facebook Video Downloader Service using makeRequests
 * 
 * @param url - Facebook video URL (must be in format: https://www.facebook.com/share/v/...)
 * @returns Promise<NBScraperResponse<FacebookVideoData>>
 */
export async function facebookDownloader(url: string): Promise<NBScraperResponse<FacebookVideoData>> {
  try {
    // Validate input parameters
    const validation = validateRequiredParams({ url }, ['url']);
    if (!validation.status) {
      return validation;
    }

    // Validate URL format
    if (!/^https:\/\/www\.facebook\.com\/share\/v\//.test(url)) {
      return createErrorResponse('Invalid Facebook video URL format', {
        type: ScraperErrorType.INVALID_INPUT,
        context: { url }
      });
    }

    // Step 1: Get verification token
    const verifyPayload = qs.stringify({ url });
    const verifyConfig: RequestConfig = {
      method: 'POST',
      url: 'https://fdownloader.net/api/userverify',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': '/',
        'X-Requested-With': 'XMLHttpRequest'
      },
      data: verifyPayload
    };

    const verifyRes = await makeRequests<VerifyResponse>(verifyConfig);
    if (!verifyRes.status || !verifyRes.data?.token) {
      return createErrorResponse('Failed to get verification token', {
        type: ScraperErrorType.AUTH_ERROR,
        context: { service: 'FacebookDownloader' }
      });
    }

    const cftoken = verifyRes.data.token;

    // Step 2: Get video data
    const ajaxPayload = qs.stringify({
      k_exp: Math.floor(Date.now() / 1000) + 1800,
      k_token: '4901a847f621da898b5429bf38df6f3a0959738cd4eb52a2bf0cf44b3eb44cad',
      q: url,
      lang: 'id',
      web: 'fdownloader.net',
      v: 'v2',
      w: '',
      cftoken
    });

    const ajaxConfig: RequestConfig = {
      method: 'POST',
      url: 'https://v3.fdownloader.net/api/ajaxSearch',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': '/'
      },
      data: ajaxPayload
    };

    const ajaxRes = await makeRequests<AjaxResponse>(ajaxConfig);
    if (!ajaxRes.status || ajaxRes.data?.status !== 'ok' || !ajaxRes.data?.data) {
      return createErrorResponse('Failed to fetch video data', {
        type: ScraperErrorType.API_ERROR,
        context: { service: 'FacebookDownloader' }
      });
    }

    // Step 3: Parse HTML response
    const $ = cheerio.load(ajaxRes.data.data);
    const thumbnail = $('.image-fb img').attr('src') || '';
    const duration = $('.content p').text().trim();
    const title = $('.content h3').text().trim();

    const links: FacebookDownloadLink[] = [];
    $('a.download-link-fb').each((_index: number, el: cheerio.Element) => {
      const link = $(el).attr('href');
      const quality = $(el).attr('title')?.replace('Download ', '') || 'Unknown';
      const format = link?.includes('.mp4') ? 'mp4' : 'unknown';
      
      if (link) {
        links.push({ 
          quality, 
          format, 
          link 
        });
      }
    });

    if (links.length === 0) {
      return createErrorResponse('No download links found', {
        type: ScraperErrorType.NOT_FOUND,
        context: { service: 'FacebookDownloader' }
      });
    }

    return createSuccessResponse({
      title,
      duration,
      thumbnail,
      links
    });

  } catch (error) {
    return createErrorResponse(error as Error, {
      type: ScraperErrorType.API_ERROR,
      context: { service: 'FacebookDownloader' }
    });
  }
}