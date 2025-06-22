/**
 * Scrape Youtube From
 */

import {
  NBScraperResponse,
  YouTubePostData,
  ScraperErrorType,
  YouTubePostImage,
  YouTubePostType
} from '../types';
import {
  createErrorResponse,
  createSuccessResponse,
  makeRequest,
  validateRequiredParams
} from '../utils';

/**
 * Scrapes a YouTube community post to extract its content.
 * Supports text, single/multiple images, polls, and video shares.
 * @param url The URL of the YouTube community post.
 * @returns A promise that resolves to the scraped post data.
 * @example
 * ```typescript
 * import { getYoutubePost } from 'nb-scraper';
 *
 * async function fetchPost() {
 * const url = "http://youtube.com/post/UgkxChSWx6pfUUCxxHeR3LsodyV6Aqwf4GOS?si=tSbmlFuR2dYH_wtk";
 * const result = await getYoutubePost(url);
 *
 * if (result.status) {
 * console.log(`Post by ${result.data.author}`);
 * console.log(`Content: ${result.data.text}`);
 * console.log(`Post Type: ${result.data.postType}`);
 * } else {
 * console.error(result.error);
 * }
 * }
 *
 * fetchPost();
 * ```
 * @author wolep
 */
export async function getYoutubePost(url: string): Promise < NBScraperResponse <
  YouTubePostData >> {
    try {
      validateRequiredParams({ url }, ['url']);
      
      const response = await makeRequest({ url });
      const html = response.data as string;
      
      const match = html.match(/ytInitialData = (.+?);</)?.[1];
      if (!match) {
        return createErrorResponse(
          'Could not find ytInitialData in the page. Please ensure the YouTube post URL is correct.', {
            type: ScraperErrorType.PARSE_ERROR
          }
        );
      }
      
      const json = JSON.parse(match);
      const tabs = json.contents?.twoColumnBrowseResultsRenderer?.tabs;
      const firstTab = tabs?.[0]?.tabRenderer?.content?.sectionListRenderer
        ?.contents;
      const itemSection = firstTab?.[0]?.itemSectionRenderer?.contents;
      const postThread = itemSection?.[0]?.backstagePostThreadRenderer?.post;
      const bpr = postThread?.backstagePostRenderer;
      
      if (!bpr) {
        return createErrorResponse(
          'Failed to parse the main post renderer object.', {
            type: ScraperErrorType.PARSE_ERROR
          });
      }
      
      let postType: YouTubePostType | null = null;
      let images: YouTubePostImage[] | null = null;
      let videoShareUrl: string | null = null;
      
      const votePost = bpr.backstageAttachment?.pollRenderer?.choices;
      const multipleImagePost = bpr.backstageAttachment?.postMultiImageRenderer
        ?.images;
      const singleImagePost = bpr.backstageAttachment?.backstageImageRenderer
        ?.image?.thumbnails;
      const videoSharePost = bpr.backstageAttachment?.videoRenderer?.videoId;
      
      if (votePost) {
        let isVoteImage = false;
        images = votePost.map((v: {
          text ? : { runs ? : { text: string } [] };
          image ? : { thumbnails ? : { url: string } [] }
        }) => {
          const text = v.text?.runs?.[0]?.text || '';
          const thumbnails = v.image?.thumbnails;
          let imageUrl: string | null = null;
          if (thumbnails && thumbnails.length > 0) {
            imageUrl = thumbnails[thumbnails.length - 1].url;
            isVoteImage = true;
          }
          return { text, url: imageUrl };
        });
        postType = isVoteImage ? "voteImage" : "voteText";
      } else if (multipleImagePost) {
        postType = "multipleImages";
        images = multipleImagePost.map((v: any) => ({
          url: v.backstageImageRenderer.image.thumbnails.map((thumb:
            any) => thumb.url).pop(),
          text: null
        }));
      } else if (singleImagePost) {
        postType = "singleImage";
        const lastThumbnail = singleImagePost && singleImagePost.length > 0 ?
          singleImagePost[singleImagePost.length - 1] :
          null;
        images = [{
          url: lastThumbnail?.url || null,
          text: null
        }];
      } else if (videoSharePost) {
        postType = "videoShare";
        videoShareUrl = new URL(url).origin + "/watch?v=" + videoSharePost;
      } else {
        postType = "text";
      }
      
      const result: YouTubePostData = {
        author: bpr.authorText?.runs?.[0]?.text || 'Unknown',
        authorUrl: new URL(url).origin + (bpr.authorEndpoint?.commandMetadata
          ?.webCommandMetadata?.url || ''),
        publishTime: bpr.publishedTimeText?.runs?.[0]?.text || '',
        text: bpr.contentText?.runs?.map((run: { text: string }) => run.text)
          .join('') || '',
        like: bpr.voteCount?.accessibility?.accessibilityData?.label || null,
        images,
        videoShareUrl,
        postType
      };
      
      return createSuccessResponse(result);
      
    } catch (error) {
      return createErrorResponse(error as Error, {
        type: ScraperErrorType.API_ERROR,
        context: { service: 'YouTubePost' }
      });
    }
  }