const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');

const { dispatch, checkHealth } = require('../adapters/ollama');

describe('ollama adapter', () => {
  let server;
  let serverPort;

  // Helper to create a local HTTP server simulating Ollama
  function startMockOllama(handler) {
    return new Promise((resolve) => {
      server = http.createServer(handler);
      server.listen(0, '127.0.0.1', () => {
        serverPort = server.address().port;
        resolve();
      });
    });
  }

  function stopServer() {
    return new Promise((resolve) => {
      if (server) server.close(resolve);
      else resolve();
    });
  }

  describe('dispatch', () => {
    it('sends chat request and returns response', async () => {
      const mockResponse = {
        message: { role: 'assistant', content: 'Hello from local model' },
        done: true,
        prompt_eval_count: 15,
        eval_count: 10,
        model: 'llama3',
      };

      await startMockOllama((req, res) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          const parsed = JSON.parse(body);
          assert.equal(parsed.model, 'llama3');
          assert.equal(parsed.stream, false);
          assert.ok(parsed.messages.length > 0);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(mockResponse));
        });
      });

      try {
        const result = await dispatch(
          { endpoint: `http://127.0.0.1:${serverPort}`, model_name: 'llama3' },
          [{ role: 'user', content: 'Hello' }],
          'You are helpful',
          {}
        );

        assert.equal(result.message.content, 'Hello from local model');
        assert.equal(result.done, true);
      } finally {
        await stopServer();
      }
    });

    it('throws when model_name is missing', async () => {
      await assert.rejects(
        () => dispatch(
          { endpoint: 'http://127.0.0.1:9999' },
          [{ role: 'user', content: 'Hello' }],
          null,
          {}
        ),
        /missing "model_name"/
      );
    });

    it('throws on non-2xx status', async () => {
      await startMockOllama((req, res) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'model not found' }));
        });
      });

      try {
        await assert.rejects(
          () => dispatch(
            { endpoint: `http://127.0.0.1:${serverPort}`, model_name: 'nonexistent' },
            [{ role: 'user', content: 'Hello' }],
            null,
            {}
          ),
          /Ollama 404/
        );
      } finally {
        await stopServer();
      }
    });

    it('includes system message in messages array', async () => {
      let receivedMessages;

      await startMockOllama((req, res) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          receivedMessages = JSON.parse(body).messages;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: { content: 'ok' }, done: true }));
        });
      });

      try {
        await dispatch(
          { endpoint: `http://127.0.0.1:${serverPort}`, model_name: 'test' },
          [{ role: 'user', content: 'Hello' }],
          'System prompt here',
          {}
        );

        assert.equal(receivedMessages[0].role, 'system');
        assert.equal(receivedMessages[0].content, 'System prompt here');
        assert.equal(receivedMessages[1].role, 'user');
      } finally {
        await stopServer();
      }
    });

    it('passes temperature and max_tokens as options', async () => {
      let receivedBody;

      await startMockOllama((req, res) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          receivedBody = JSON.parse(body);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: { content: 'ok' }, done: true }));
        });
      });

      try {
        await dispatch(
          { endpoint: `http://127.0.0.1:${serverPort}`, model_name: 'test' },
          [{ role: 'user', content: 'Hello' }],
          null,
          { temperature: 0.5, max_tokens: 200 }
        );

        assert.equal(receivedBody.options.temperature, 0.5);
        assert.equal(receivedBody.options.num_predict, 200);
      } finally {
        await stopServer();
      }
    });
  });

  describe('checkHealth', () => {
    it('returns healthy with model list', async () => {
      await startMockOllama((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ models: [{ name: 'llama3' }, { name: 'mistral' }] }));
      });

      try {
        const result = await checkHealth(`http://127.0.0.1:${serverPort}`);
        assert.equal(result.healthy, true);
        assert.deepEqual(result.models, ['llama3', 'mistral']);
      } finally {
        await stopServer();
      }
    });

    it('returns unhealthy when server is down', async () => {
      const result = await checkHealth('http://127.0.0.1:1');
      assert.equal(result.healthy, false);
      assert.deepEqual(result.models, []);
    });
  });
});
