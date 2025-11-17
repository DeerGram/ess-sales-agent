import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,
  duration: '30s',
};

const API_BASE_URL = __ENV.API_BASE_URL ?? 'http://localhost:5000';

export default function run() {
  const payload = JSON.stringify({
    conversationId: `load-${__ITER}-${Math.random()}`,
    content: 'Provide a quick pulse update on my schedule.',
  });

  const response = http.post(`${API_BASE_URL}/api/chat`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(response, {
    'status is 200': (res) => res.status === 200,
  });

  sleep(1);
}
