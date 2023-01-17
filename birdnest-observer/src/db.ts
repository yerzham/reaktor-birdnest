import { connect } from './deps.ts';

export const redis = await connect({
  hostname: Deno.env.get('REDIS_HOST') || 'localhost',
  port: Number(Deno.env.get('REDIS_PORT')) || 6379,
  password: Deno.env.get('REDIS_PASSWORD') || '',
});

export const redisEvents = await connect({
  hostname: Deno.env.get('REDIS_HOST') || 'localhost',
  port: Number(Deno.env.get('REDIS_PORT')) || 6379,
  password: Deno.env.get('REDIS_PASSWORD') || '',
});