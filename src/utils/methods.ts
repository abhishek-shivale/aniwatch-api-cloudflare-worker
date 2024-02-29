import { CheerioAPI, SelectorType, load } from "cheerio";
import { HTTPException } from "hono/http-exception";
import { Anime, Top10Anime, Top10AnimeTimePeriod } from "../types/method";

export const extractAnimes = (
  $: CheerioAPI,
  selector: SelectorType
): Anime[] => {
    const animes: Array<Anime> = [];

    $(selector).each((i, el) => {
      const htmlContent = $(el).html();
      if(htmlContent){
      const api = load(htmlContent);
        const animeId =
          api(".film-detail .film-name .dynamic-name")
            ?.attr("href")
            ?.slice(1)
            .split("?ref=search")[0] || null;
  
        animes.push({
          id: animeId,
          name: api(".film-detail .film-name .dynamic-name")
            ?.text()
            ?.trim(),
          poster:
           api(".film-poster .film-poster-img")
              ?.attr("data-src")
              ?.trim() || null,
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
                api(".film-poster .tick-sub")
                  ?.text()
                  ?.trim()
                  .split(" ")
                  .pop()
              ) || null,
            dub:
              Number(
                api(".film-poster .tick-dub")
                  ?.text()
                  ?.trim()
                  .split(" ")
                  .pop()
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
  try {
    const animes: Array<Top10Anime> = [];
    const selector = `#top-viewed-${period} ul li`;

    $(selector).each((i, el) => {
      animes.push({
        id:
          $(el)
            .find(".film-detail .dynamic-name")
            ?.attr("href")
            ?.slice(1)
            .trim() || null,
        rank: Number($(el).find(".film-number span")?.text()?.trim()) || null,
        name: $(el).find(".film-detail .dynamic-name")?.text()?.trim() || null,
        poster:
          $(el)
            .find(".film-poster .film-poster-img")
            ?.attr("data-src")
            ?.trim() || null,
        episodes: {
          sub:
            Number(
              $(el)
                .find(".film-detail .fd-infor .tick-item.tick-sub")
                ?.text()
                ?.trim()
            ) || null,
          dub:
            Number(
              $(el)
                .find(".film-detail .fd-infor .tick-item.tick-dub")
                ?.text()
                ?.trim()
            ) || null,
        },
      });
    });

    return animes;
  } catch (err: any) {
    return err
  }
};
