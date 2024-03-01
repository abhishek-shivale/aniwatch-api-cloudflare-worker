import { Hono } from "hono";

import AnimeRouter from "./routes/AnimeRouter";

const app = new Hono();

app.route('/anime', AnimeRouter)



export default app;
