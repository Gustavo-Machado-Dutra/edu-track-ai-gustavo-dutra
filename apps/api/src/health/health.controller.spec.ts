import { describe, expect, it } from 'vitest';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('returns API health status', () => {
    const controller = new HealthController();

    expect(controller.getHealth()).toEqual({
      data: {
        service: 'api',
        status: 'ok',
      },
    });
  });
});
