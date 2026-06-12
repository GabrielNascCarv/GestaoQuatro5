import 'reflect-metadata';
import path from 'node:path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
import fastify from 'fastify';
import cors from '@fastify/cors';
import { router } from './routes';

const app = fastify({ logger: false });
const port = Number(process.env.PORT) || 3000;

app.register(cors, { 
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
});

app.register(router, { prefix: '/api' });

const start = async () => {
  try {
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Backend running at http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
