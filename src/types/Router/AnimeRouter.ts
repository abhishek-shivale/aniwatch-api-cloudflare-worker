
export interface Episode {
  sub?: number | null;
  dub?: number | null;
}
export interface anime {
  rank?: number | null | undefined;
  id?: string | null;
  name?: string | null;
  description?: string | null;
  poster?: string | null;
  jname?: string | null;
  episodes?: {
    sub?: number | null;
    dub: number | null;
  };
  otherInfo?: any;
}

interface SpotlightAnimes {
  rank?: number | null;
  id?: string | null;
  name?: string | null;
  description?: string | null;
  poster?: string | null;
  jname?: string | null;
  episodes?: Episode;
  otherInfo?: any;
}

interface trendingAnimes {
  rank?: number | null;
  name?: string | null;
  id?: string | null;
  poster?: string | null;
}

interface top10Animes {
  today: any[];
  week: any[];
  month: any[];
}

export interface Res {
  spotlightAnimes: SpotlightAnimes[];
  trendingAnimes: trendingAnimes[];
  latestEpisodeAnimes: any[];
  topUpcomingAnimes: any[];
  topAiringAnimes: any[];
  genres: any[];
  top10Animes: top10Animes;
}
