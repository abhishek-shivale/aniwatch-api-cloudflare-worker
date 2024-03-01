import { Hono } from "hono";
import { CheerioAPI, SelectorType, load } from "cheerio";
import { Res, ScrapedAnimeAboutInfo, anime } from "../types/Router/AnimeRouter";
import { SRC_HOME_URL } from "../utils/constants";
import {
  extractAnimes,
  extractMostPopularAnimes,
  extractTop10Animes,
} from "../utils/methods";

const AnimeRouter = new Hono();
//Home
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
          ?.trim() ?? null;

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

  const topUpcomingSelector: SelectorType =
    "#main-content .block_area_home:nth-of-type(3) .tab-content .film_list-wrap .flw-item";
  res.topUpcomingAnimes = extractAnimes($, topUpcomingSelector);

  const genreSelector: SelectorType =
    "#main-sidebar .block_area.block_area_sidebar.block_area-genres .sb-genre-list li";
  $(genreSelector).each((i, el) => {
    res.genres.push(`${$(el).text().trim()}`);
  });

  const mostViewedSelector: SelectorType =
    '#main-sidebar .block_area-realtime [id^="top-viewed-"]';
  $(mostViewedSelector).each((i, el) => {
    const htmlContent = $(el).html();
    if (htmlContent) {
      const period = $(el).attr("id")?.split("-")?.pop()?.trim();
      console.log(period);
      if (period === "day") {
        res.top10Animes.today = extractTop10Animes($, period);
        return;
      }
      if (period === "week") {
        res.top10Animes.week = extractTop10Animes($, period);
        return;
      }
      if (period === "month") {
        res.top10Animes.month = extractTop10Animes($, period);
      }
    }
  });

  const topAiringSelector: SelectorType =
    "#anime-featured .row div:nth-of-type(1) .anif-block-ul ul li";
  $(topAiringSelector).each((i, el) => {
    const htmlContent = $(el).html();
    if (htmlContent) {
      const api = load(htmlContent);
      const otherInfo = api(".fd-infor .fdi-item")
        .map((i, el) => $(el).text().trim())
        .get();

      res.topAiringAnimes.push({
        id: api(".film-detail .film-name .dynamic-name")
          ?.attr("href")
          ?.slice(1)
          ?.trim(),
        name: api(".film-detail .film-name .dynamic-name")
          ?.attr("title")
          ?.trim(),
        jname: api(".film-detail .film-name .dynamic-name")
          ?.attr("data-jname")
          ?.trim(),
        poster: api(".film-poster a .film-poster-img")
          ?.attr("data-src")
          ?.trim(),
        otherInfo,
      });
    }
  });

  return c.json({ success: true, res });
});

//animeinfo
// /anime/info?id=${anime-id}
AnimeRouter.get("/info", async (c) => {
  const res: ScrapedAnimeAboutInfo = {
    anime: {
      info: {
        id: null,
        name: null,
        poster: null,
        description: null,
        stats: {
          rating: null,
          quality: null,
          episodes: {
            sub: null,
            dub: null,
          },
          type: null,
          duration: null,
        },
      },
      moreInfo: {},
    },
    seasons: [],
    mostPopularAnimes: [],
    relatedAnimes: [],
    recommendedAnimes: [],
  };
  const id: string | undefined = c.req?.query("id");
  if (id) {
    const animeUrl: URL = new URL(id, SRC_HOME_URL);
    const mainPage = await fetch(animeUrl.href);
    const mainPageText = await mainPage.text();
    const $: CheerioAPI = load(mainPageText);

    const selector: SelectorType = "#ani_detail .container .anis-content";

    res.anime.info.id =
      $(selector)
        ?.find(".anisc-detail .film-buttons a.btn-play")
        ?.attr("href")
        ?.split("/")
        ?.pop() || null;
    res.anime.info.name =
      $(selector)
        ?.find(".anisc-detail .film-name.dynamic-name")
        ?.text()
        ?.trim() || null;
    res.anime.info.description =
      $(selector)
        ?.find(".anisc-detail .film-description .text")
        .text()
        ?.split("[")
        ?.shift()
        ?.trim() || null;
    res.anime.info.poster =
      $(selector)?.find(".film-poster .film-poster-img")?.attr("src")?.trim() ||
      null;

    res.anime.info.stats.rating =
      $(`${selector} .film-stats .tick .tick-pg`)?.text()?.trim() || null;
    res.anime.info.stats.quality =
      $(`${selector} .film-stats .tick .tick-quality`)?.text()?.trim() || null;
    res.anime.info.stats.episodes = {
      sub:
        Number($(`${selector} .film-stats .tick .tick-sub`)?.text()?.trim()) ||
        null,
      dub:
        Number($(`${selector} .film-stats .tick .tick-dub`)?.text()?.trim()) ||
        null,
    };
    res.anime.info.stats.type =
      $(`${selector} .film-stats .tick`)
        ?.text()
        ?.trim()
        ?.replace(/[\s\n]+/g, " ")
        ?.split(" ")
        ?.at(-2) || null;
    res.anime.info.stats.duration =
      $(`${selector} .film-stats .tick`)
        ?.text()
        ?.trim()
        ?.replace(/[\s\n]+/g, " ")
        ?.split(" ")
        ?.pop() || null;

    $(`${selector} .anisc-info-wrap .anisc-info .item:not(.w-hide)`).each(
      (i, el) => {
        const htmlContent = $(el).html();
        if (htmlContent) {
          let key = $(el)
            .find(".item-head")
            .text()
            .toLowerCase()
            .replace(":", "")
            .trim();
          key = key.includes(" ") ? key.replace(" ", "") : key;

          const value = [
            ...$(el)
              .find("*:not(.item-head)")
              .map((i, el) => $(el).text().trim()),
          ]
            .map((i) => `${i}`)
            .toString()
            .trim();

          if (key === "genres") {
            res.anime.moreInfo[key] = value.split(",").map((i) => i.trim());
            return;
          }
          if (key === "producers") {
            res.anime.moreInfo[key] = value.split(",").map((i) => i.trim());
            return;
          }
          res.anime.moreInfo[key] = value;
        }
      }
    );

    const seasonsSelector: SelectorType = "#main-content .os-list a.os-item";
    $(seasonsSelector).each((i, el) => {
      res.seasons.push({
        id: $(el)?.attr("href")?.slice(1)?.trim() || null,
        name: $(el)?.attr("title")?.trim() || null,
        title: $(el)?.find(".title")?.text()?.trim(),
        poster:
          $(el)
            ?.find(".season-poster")
            ?.attr("style")
            ?.split(" ")
            ?.pop()
            ?.split("(")
            ?.pop()
            ?.split(")")[0] || null,
        isCurrent: $(el).hasClass("active"),
      });
    });

    const relatedAnimeSelector: SelectorType =
      "#main-sidebar .block_area.block_area_sidebar.block_area-realtime:nth-of-type(1) .anif-block-ul ul li";
    res.relatedAnimes = extractMostPopularAnimes($, relatedAnimeSelector);

    const mostPopularSelector: SelectorType =
      "#main-sidebar .block_area.block_area_sidebar.block_area-realtime:nth-of-type(2) .anif-block-ul ul li";
    res.mostPopularAnimes = extractMostPopularAnimes($, mostPopularSelector);

    const recommendedAnimeSelector: SelectorType =
      "#main-content .block_area.block_area_category .tab-content .flw-item";
    res.recommendedAnimes = extractAnimes($, recommendedAnimeSelector);
  }
  return c.json({
    res: res,
  });
});




export default AnimeRouter;
