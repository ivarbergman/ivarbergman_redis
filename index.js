import Redis from 'ioredis';

export default ({connection, ttl = 60, ...redisOptions}) => {
  const instance = createRedisInstance();
  return {
    connected: () => {
      return true;
    },
    set: (key, value, ex = ttl) => {
      const _value = encode_value(value);
      return instance.set(key, _value, 'EX', ex)
    },
    del: (key) => {
      return instance.del(key)
    },
    get: (key) => {
      const _value = instance.get(key);
      return decode_value(_value);
    },
  }

  function encode_value(value) {
    return JSON.stringify(value)
  }

  function decode_value(value) {
    try {
      return JSON.parse(value);
    } catch (error) {
      // 
    }
    return null;
  }

  function createRedisInstance() {
    try {
      const options = {
        lazyConnect: true,
        showFriendlyErrorStack: true,
        enableAutoPipelining: true,
        maxRetriesPerRequest: 0,
        retryStrategy: (times) => {
          if (times > 3) {
            throw new Error(`[Redis] Could not connect after ${times} attempts`);
          }
          return Math.min(times * 200, 1000);
        },
        ...redisOptions
      };

      let redis = new Redis(connection, options);

      redis.on('error', (error) => {
        console.warn('[Redis] Error connecting', error);
      });

      return redis;
    } catch (e) {
      throw new Error(`[Redis] Could not create a Redis instance`);
    }
  }
}

