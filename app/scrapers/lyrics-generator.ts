/* Scrape Ai Generator Lyrics
*/

import {
  NBScraperResponse,
  LyricsGeneratorData,
  LyricsGeneratorOptions,
  ScraperErrorType
} from '../types';
import {
  createErrorResponse,
  createSuccessResponse,
  makeRequest,
  validateRequiredParams
} from '../utils';

// Configuration for the lyrics generator
const LYRICS_CONFIG = {
  genre: {
    pop: 'Pop', rock: 'Rock', folk: 'Folk', rap: 'Rap',
    rnb: 'R&B', jazz: 'Jazz', classical: 'Classical',
    electronic: 'Electronic', country: 'Country', blues: 'Blues'
  },
  mood: {
    happy: 'Happy', sad: 'Sad', romantic: 'Romantic', energetic: 'Energetic',
    peaceful: 'Peaceful', melancholic: 'Melancholic', angry: 'Angry',
    hopeful: 'Hopeful', nostalgic: 'Nostalgic', uplifting: 'Uplifting'
  },
  structure: {
    verse_chorus: 'Verse + Chorus',
    verse_chorus_bridge: 'Verse + Chorus + Bridge',
    verse_prechorus_chorus: 'Verse + Pre-Chorus + Chorus',
    verse_chorus_bridge_chorus: 'Verse + Chorus + Bridge + Chorus',
    verse_only: 'Verse Only',
    chorus_only: 'Chorus Only'
  },
  language: {
    en: 'English',
    id: 'Indonesian'
  }
};

const API_URL = 'https://lyricsintosong.ai/api/generate-lyrics';
const API_HEADERS = {
  'Content-Type': 'application/json',
  'Origin': 'https://lyricsintosong.ai',
  'Referer': 'https://lyricsintosong.ai/lyrics-generator',
  'User-Agent': 'Mozilla/5.0'
};


/**
 * Generates song lyrics based on a topic, genre, mood, and structure.
 * @param options - The configuration for lyric generation.
 * @returns A promise that resolves to the generated lyrics data.
 * @example
 * ```typescript
 * import { generateLyrics } from 'nb-scraper';
 *
 * async function createSong() {
 * const result = await generateLyrics({
 * topic: 'longing for a summer long past',
 * genre: 'folk',
 * mood: 'nostalgic',
 * language: 'en',
 * structure: 'verse_chorus_bridge'
 * });
 *
 * if (result.status) {
 * console.log(`Title: ${result.data.title}`);
 * console.log('--- LYRICS ---');
 * console.log(result.data.lyrics);
 * } else {
 * console.error(result.error);
 * }
 * }
 *
 * createSong();
 * ```
 * @author Saaofc
 */
export async function generateLyrics(
  options: LyricsGeneratorOptions
): Promise<NBScraperResponse<LyricsGeneratorData>> {
  try {
    validateRequiredParams(options, ['keyword']);

    const {
      topic,
      genre = 'pop',
      mood = 'happy',
      structure = 'verse_chorus',
      language = 'en'
    } = options;

    // Validate inputs against the configuration keys
    if (!Object.keys(LYRICS_CONFIG.genre).includes(genre)) {
      return createErrorResponse(`Invalid genre. Available: ${Object.keys(LYRICS_CONFIG.genre).join(', ')}`, { type: ScraperErrorType.INVALID_PARAMETER });
    }
    if (!Object.keys(LYRICS_CONFIG.mood).includes(mood)) {
      return createErrorResponse(`Invalid mood. Available: ${Object.keys(LYRICS_CONFIG.mood).join(', ')}`, { type: ScraperErrorType.INVALID_PARAMETER });
    }

    const payload = {
      topic,
      style: genre,
      mood,
      structure: structure.replace(/_/g, '-'),
      language
    };

    const response = await makeRequest<{
        data?: { title?: string; lyrics?: string } 
    }>({
        method: 'POST',
        url: API_URL,
        data: payload,
        headers: API_HEADERS
    });

    const { title = 'Untitled', lyrics } = response.data?.data || {};

    if (!lyrics) {
      return createErrorResponse('Lyrics not found in API response.', {
        type: ScraperErrorType.NOT_FOUND,
        context: { service: 'LyricsGenerator' }
      });
    }

    return createSuccessResponse({
      title,
      lyrics,
      topic,
      genre: LYRICS_CONFIG.genre[genre],
      mood: LYRICS_CONFIG.mood[mood],
      structure: LYRICS_CONFIG.structure[structure],
      language: LYRICS_CONFIG.language[language]
    });

  } catch (error) {
    return createErrorResponse(error as Error, {
      type: ScraperErrorType.API_ERROR,
      context: { service: 'LyricsGenerator' }
    });
  }
}