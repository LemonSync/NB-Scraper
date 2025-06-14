import axios, { AxiosRequestConfig } from 'axios';
import FormData from 'form-data';
import {
  NBScraperResponse,
  ScraperErrorType,
  YouTubeDownloadResult,
  YouTubeMP3Response,
  YouTubeVideoResponse,
  YouTubeProgressResponse
} from '../types';
import {
  createErrorResponse,
  createSuccessResponse,
  isValidUrl,
  extractDomain
} from '../utils';

const validQualities = {
  "480": 480,
  "1080": 1080,
  "720": 720,
  "360": 360,
  "audio": "mp3"
};

const YOUTUBE_DOMAINS = new Set([
  'youtube.com',
  'www.youtube.com',
  'youtu.be',
  'm.youtube.com'
]);

function validateYouTubeUrl(url: string): NBScraperResponse<URL> {
  if (!isValidUrl(url)) {
    return createErrorResponse("Invalid YouTube URL", {
      type: ScraperErrorType.INVALID_INPUT
    });
  }

  const domain = extractDomain(url);
  if (!domain || !YOUTUBE_DOMAINS.has(domain.replace(/^www\./, ''))) {
    return createErrorResponse("URL must be from YouTube domain", {
      type: ScraperErrorType.INVALID_INPUT,
      context: { validDomains: Array.from(YOUTUBE_DOMAINS) }
    });
  }

  try {
    return createSuccessResponse(new URL(url));
  } catch (error) {
    return createErrorResponse(error as Error, {
      type: ScraperErrorType.INVALID_INPUT
    });
  }
}

export const Ytdl = {
  /**
   * Download YouTube video as MP3
   * @param url - YouTube video URL
   */
  mp3: async (url: string): Promise<NBScraperResponse<YouTubeDownloadResult>> => {
    const urlValidation = validateYouTubeUrl(url);
    if (!urlValidation.status) return urlValidation;

    const ds = new FormData();
    ds.append("url", url);

    try {
      const config: AxiosRequestConfig = {
        method: 'post',
        url: 'https://www.youtubemp3.ltd/convert',
        headers: {
          ...ds.getHeaders(),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        data: ds,
        timeout: 45000
      };

      const response = await axios(config);
      const data = response.data as YouTubeMP3Response;

      if (!data?.link) {
        return createErrorResponse("Failed to get download link", {
          type: ScraperErrorType.API_ERROR
        });
      }

      return createSuccessResponse({
        title: data.filename || "Unknown Title",
        downloadUrl: data.link,
        type: "mp3"
      });
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        return createErrorResponse("Request timeout", {
          type: ScraperErrorType.NETWORK_ERROR
        });
      }
      
      return createErrorResponse(
        error.response?.data?.message || error.message || "failed to convert audio",
        {
          type: ScraperErrorType.API_ERROR
        }
      );
    }
  },

  /**
   * Download YouTube video in specified quality
   * @param url - YouTube video URL
   * @param quality - Quality option (480, 720, 1080, 360, audio)
   */
  mp4: async (url: string, quality: string = "720"): Promise<NBScraperResponse<YouTubeDownloadResult>> => {
    const urlValidation = validateYouTubeUrl(url);
    if (!urlValidation.status) return urlValidation;

    if (!Object.keys(validQualities).includes(quality)) {
      return createErrorResponse("Quality not valid!", {
        type: ScraperErrorType.INVALID_INPUT,
        context: { 
          availableQuality: Object.keys(validQualities) 
        }
      });
    }

    const qualitys = validQualities[quality as keyof typeof validQualities];
    const initialUrl = `https://p.oceansaver.in/ajax/download.php?button=1&start=1&end=1&format=${qualitys}&iframe_source=https://allinonetools.com/&url=${encodeURIComponent(url)}`;

    try {
      // First request to start download process
      const firstResponse = await axios.get<YouTubeVideoResponse>(initialUrl, { 
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!firstResponse.data?.progress_url) {
        return createErrorResponse("Gagal memulai proses download", {
          type: ScraperErrorType.API_ERROR
        });
      }

      const metadata: Partial<YouTubeDownloadResult> = {
        title: firstResponse.data.info?.title || "Unknown Title",
        thumbnail: firstResponse.data.info?.image,
        quality: quality === "audio" ? undefined : quality,
        type: quality === "audio" ? "mp3" : "mp4"
      };

      // Poll for download progress
      const maxAttempts = 40;
      let attempts = 0;
      let downloadUrl = "";

    //  console.log("Memproses download, mohon tunggu...");

      while (attempts < maxAttempts && !downloadUrl) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        try {
          const progressResponse = await axios.get<YouTubeProgressResponse>(
            firstResponse.data.progress_url, 
            { 
              timeout: 15000,
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
            }
          );

          if (progressResponse.data?.download_url) {
            downloadUrl = progressResponse.data.download_url;
            break;
          }

          if (progressResponse.data?.progress && progressResponse.data.progress < 100) {
          }
        } catch (pollError) {
        }

        attempts++;
      }

      if (!downloadUrl) {
        return createErrorResponse("Timeout: Proses download terlalu lama, coba lagi", {
          type: ScraperErrorType.NETWORK_ERROR
        });
      }

      metadata.downloadUrl = downloadUrl;

      return createSuccessResponse(metadata as YouTubeDownloadResult);
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        return createErrorResponse("Request timeout", {
          type: ScraperErrorType.NETWORK_ERROR
        });
      }
      
      return createErrorResponse(
        error.response?.data?.message || error.message || "Video Download Failed",
        {
          type: ScraperErrorType.API_ERROR
        }
      );
    }
  },

  isValidYouTubeUrl: (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return youtubeRegex.test(url);
  },

  extractVideoId: (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }
};