import { Hono } from "hono";
import { LambdaContext, handle } from "hono/aws-lambda";
import { S3ObjectCreatedNotificationEvent } from "aws-lambda";

type Bindings = {
  event: S3ObjectCreatedNotificationEvent;
  lambdaContext: LambdaContext;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  const event = c.env.event;
  const context = c.env.lambdaContext;

  console.log(JSON.stringify({ event }, null, 2));

  return c.json({ ok: true });
});

export const handler = handle(app);
