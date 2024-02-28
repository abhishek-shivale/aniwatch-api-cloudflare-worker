import { Hono } from "hono";

const app = new Hono();

app.get("/hi", async (c: any, next: any) => {
  c.text("hi");
});

export default app;
