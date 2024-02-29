export interface Anime {
  id: string | null;
  name: string | null;
  poster: string | null;
  duration: string | null;
  type: string | null;
  rating: string | null;
  episodes: {
    sub: number | null;
    dub: number | null;
  };
}

type CommonAnimeProps = "id" | "name" | "poster";

export type Top10AnimeTimePeriod = "day" | "week" | "month";

export interface Top10Anime extends Pick<Anime, CommonAnimeProps | "episodes"> {
  rank: number | null;
}
