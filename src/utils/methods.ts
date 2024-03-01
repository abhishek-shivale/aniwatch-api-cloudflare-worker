import { CheerioAPI, SelectorType, html, load } from "cheerio";
import { HTTPException } from "hono/http-exception";
import {
  Anime,
  MostPopularAnime,
  Top10Anime,
  Top10AnimeTimePeriod,
} from "../types/method";

export const extractAnimes = ($: CheerioAPI,selector: SelectorType): Anime[] => {
  const animes: Array<Anime> = [];

  $(selector).each((i, el) => {
    const htmlContent = $(el).html();
    if (htmlContent) {
      const api = load(htmlContent);
      const animeId =
        api(".film-detail .film-name .dynamic-name")
          ?.attr("href")
          ?.slice(1)
          .split("?ref=search")[0] || null;

      animes.push({
        id: animeId,
        name: api(".film-detail .film-name .dynamic-name")?.text()?.trim(),
        poster:
          api(".film-poster .film-poster-img")?.attr("data-src")?.trim() ||
          null,
        duration: api(".film-detail .fd-infor .fdi-item.fdi-duration")
          ?.text()
          ?.trim(),
        type: api(".film-detail .fd-infor .fdi-item:nth-of-type(1)")
          ?.text()
          ?.trim(),
        rating: api(".film-poster .tick-rate")?.text()?.trim() || null,
        episodes: {
          sub:
            Number(
              api(".film-poster .tick-sub")?.text()?.trim().split(" ").pop()
            ) || null,
          dub:
            Number(
              api(".film-poster .tick-dub")?.text()?.trim().split(" ").pop()
            ) || null,
        },
      });
    }
  });

  return animes;
};

export const extractTop10Animes = (
  $: CheerioAPI,
  period: Top10AnimeTimePeriod
): Array<Top10Anime> => {
  const animes: Array<Top10Anime> = [];
  const selector = `#top-viewed-${period} ul li`;

  $(selector).each((i, el) => {
    const htmlContent = $(el).html();
    if (htmlContent) {
      const api = load(htmlContent);
      animes.push({
        id:
          api(".film-detail .dynamic-name")?.attr("href")?.slice(1).trim() ||
          null,
        rank: Number(api(".film-number span")?.text()?.trim()) || null,
        name: api(".film-detail .dynamic-name")?.text()?.trim() || null,
        poster:
          api(".film-poster .film-poster-img")?.attr("data-src")?.trim() ||
          null,
        episodes: {
          sub:
            Number(
              api(".film-detail .fd-infor .tick-item.tick-sub")?.text()?.trim()
            ) || null,
          dub:
            Number(
              api(".film-detail .fd-infor .tick-item.tick-dub")?.text()?.trim()
            ) || null,
        },
      });
    }
  });
  return animes;
};

export const extractMostPopularAnimes = (
  $: CheerioAPI,
  selector: SelectorType
): Array<MostPopularAnime> => {
  const animes: Array<MostPopularAnime> = [];

  $(selector).each((i, el) => {
    const htmlContent = $(el).html();
    if (htmlContent) {
      const api = load(htmlContent);

      animes.push({
        id:
          api(".film-detail .dynamic-name")?.attr("href")?.slice(1).trim() ||
          null,
        name: api(".film-detail .dynamic-name")?.text()?.trim() || null,
        poster:
          api(".film-poster .film-poster-img")?.attr("data-src")?.trim() ||
          null,
        jname:
          api(".film-detail .film-name .dynamic-name")
            .attr("data-jname")
            ?.trim() || null,

        episodes: {
          sub: Number(api(".fd-infor .tick .tick-sub")?.text()?.trim()) || null,
          dub: Number(api(".fd-infor .tick .tick-dub")?.text()?.trim()) || null,
        },
        type:
          api(".fd-infor .tick")
            ?.text()
            ?.trim()
            ?.replace(/[\s\n]+/g, " ")
            ?.split(" ")
            ?.pop() || null,
      });
    }
  });

  return animes;
};
