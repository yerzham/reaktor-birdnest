FROM redis:7.0.7-alpine3.17

COPY redis.conf /usr/local/etc/redis/redis.conf

CMD redis-server --requirepass $REDIS_PASSWORD