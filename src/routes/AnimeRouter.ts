import { Hono } from "hono";
import { CheerioAPI, SelectorType, load } from "cheerio";
import { Res, anime } from "../types/Router/AnimeRouter";
import { SRC_HOME_URL } from "../utils/constants";
import { extractAnimes } from "../utils/methods";

const AnimeRouter = new Hono();

AnimeRouter.get("/home", async (c) => {
  const res: Res = {
    spotlightAnimes: [],
    trendingAnimes: [],
    latestEpisodeAnimes: [],
    topUpcomingAnimes: [],
    top10Animes: {
      today: [],
      week: [],
      month: [],
    },
    topAiringAnimes: [],
    genres: [],
  };

  const mainPage = await fetch(SRC_HOME_URL);

  const mainPageText = await mainPage.text();
  const $: CheerioAPI = load(mainPageText);

  const spotlightSelector: SelectorType =
    "#slider .swiper-wrapper .swiper-slide";

  $(spotlightSelector).each((i, el) => {
    const spotlight: anime = {};
    const htmlContent = $(el).html();

    if (htmlContent) {
      const api = load(htmlContent);
      spotlight.otherInfo =
        api(".deslide-item-content .sc-detail .scd-item")
          .map((i, el) => $(el).text().trim())
          .get()
          .slice(0, -1) || null;

      spotlight.rank = Number(
        api(".deslide-item-content .desi-sub-text")
          ?.text()
          .trim()
          .split(" ")[0]
          .slice(1) || null
      );

      spotlight.id = api(".deslide-item-content .desi-buttons a")
        ?.last()
        ?.attr("href")
        ?.slice(1)
        ?.trim();

      spotlight.name = api(
        ".deslide-item-content .desi-head-title.dynamic-name"
      )
        ?.text()
        .trim();

      spotlight.description =
        api(".deslide-item-content .desi-description")
          ?.text()
          ?.split("[")
          ?.shift()
          ?.trim() ?? null

      spotlight.poster =
        api(".deslide-cover .deslide-cover-img .film-poster-img")
          ?.attr("src")
          ?.trim() ?? null;

      spotlight.jname =
        api(".deslide-item-content .desi-head-title.dynamic-name")
          ?.attr("data-jname")
          ?.trim() ?? null;

      spotlight.episodes = {
        sub:
          Number(
            api(
              ".deslide-item-content .sc-detail .scd-item .tick-item.tick-sub"
            )
              ?.text()
              ?.trim()
          ) || null,
        dub:
          Number(
            api(
              ".deslide-item-content .sc-detail .scd-item .tick-item.tick-dub"
            )
              ?.text()
              ?.trim()
          ) || null,
      };
      res.spotlightAnimes.push(spotlight);
    }
  });

  const trendingSelector: SelectorType =
    "#trending-home .swiper-wrapper .swiper-slide";

  $(trendingSelector).each((i, el) => {
    const htmlContent = $(el).html();

    if (htmlContent) {
      const api = load(htmlContent);

      res.trendingAnimes.push({
        rank: parseInt(
          api(".item .number")?.children()?.first()?.text()?.trim()
        ),
        name: api(".item .number .film-title.dynamic-name")?.text()?.trim(),
        id: api(".item .film-poster")?.attr("href")?.slice(1)?.trim(),
        poster: api(".item .film-poster .film-poster-img")
          ?.attr("data-src")
          ?.trim(),
      });
    }
  });


  const latestEpisodeSelector: SelectorType =
    "#main-content .block_area_home:nth-of-type(1) .tab-content .film_list-wrap .flw-item";
    
    $(latestEpisodeSelector).each((i, el) => {
      const htmlContent = $(el).html();
      if (htmlContent) {
        const api = load(htmlContent);
        res.latestEpisodeAnimes = extractAnimes($, latestEpisodeSelector);
      }
    });
  return c.json({ success: true, res });
});

export default AnimeRouter;
