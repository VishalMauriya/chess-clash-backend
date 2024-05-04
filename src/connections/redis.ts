import Redis from 'ioredis';

const { REDIS_HOST, REDIS_PORT } = process.env;

const redisClient = new Redis({
    host: REDIS_HOST || 'localhost',
    port: parseInt(REDIS_PORT || '6379', 10),
});

redisClient.on('connect', () => {
    console.log('Redis connected');
});

redisClient.on('error', (err) => {
    console.error('Redis connection error:', err);
});

export default redisClient;
