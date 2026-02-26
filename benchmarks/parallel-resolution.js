const Benchmark = require('benchmark');
const packet = require('dns-packet');
const Tangerine = require('..');

const host = 'netflix.com';
const record = 'A';
const servers = ['1.1.1.1', '8.8.8.8'];

const response = packet.encode({
  id: 1,
  type: 'response',
  flags: 384,
  questions: [{ name: host, type: record, class: 'IN' }],
  answers: [
    { name: host, type: record, ttl: 300, class: 'IN', data: '1.2.3.4' }
  ],
  authorities: [],
  additionals: []
});

function createMockRequest(latencyByServer) {
  return async (url, options = {}) => {
    const server = new URL(url).hostname;
    const latency = latencyByServer[server];

    if (!Number.isFinite(latency))
      throw new Error(`Missing benchmark latency for server "${server}"`);

    await new Promise((resolve, reject) => {
      const onAbort = () => {
        clearTimeout(timer);
        options.signal?.removeEventListener('abort', onAbort);
        const err = new Error('aborted');
        err.name = 'AbortError';
        err.code = 'ABORT_ERR';
        reject(err);
      };

      const timer = setTimeout(() => {
        options.signal?.removeEventListener('abort', onAbort);
        resolve();
      }, latency);

      if (options.signal?.aborted) onAbort();
      else options.signal?.addEventListener('abort', onAbort, { once: true });
    });

    return {
      statusCode: 200,
      headers: {},
      body: response
    };
  };
}

const opts = {
  timeout: 5000,
  tries: 1,
  cache: false,
  servers,
  smartRotate: false
};

//
// Deterministic benchmark profile:
// - first server intentionally slower
// - second server intentionally faster
// Serial mode will always wait for the slow first server.
// Parallel mode can fulfill from the fast server.
//
const mockRequest = createMockRequest({
  '1.1.1.1': 35,
  '8.8.8.8': 5
});

const serialResolver = new Tangerine(
  {
    ...opts,
    parallelResolution: false
  },
  mockRequest
);

const parallelResolver = new Tangerine(
  {
    ...opts,
    parallelResolution: true
  },
  mockRequest
);

const suite = new Benchmark.Suite('parallelResolution');

suite.on('start', function (ev) {
  console.log(`Started: ${ev.currentTarget.name}`);
});

suite.add('parallelResolution=false (serial)', {
  defer: true,
  async fn(deferred) {
    await serialResolver.resolve(host, record);
    deferred.resolve();
  }
});

suite.add('parallelResolution=true (parallel)', {
  defer: true,
  async fn(deferred) {
    await parallelResolver.resolve(host, record);
    deferred.resolve();
  }
});

suite.on('cycle', (ev) => {
  console.log(String(ev.target));
});

suite.on('complete', function () {
  console.log(`Fastest is: ${this.filter('fastest').map('name').join(', ')}\n`);
});

suite.run();
