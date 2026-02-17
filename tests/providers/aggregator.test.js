jest.mock('../../providers/amadeus.provider', () => ({
  search: jest.fn().mockResolvedValue([
    {
      id: 'amadeus-1',
      provider: 'amadeus',
      price: 95,
      currency: 'EUR',
      outbound: [{ origin: 'MAD', destination: 'BCN', departure: '2026-03-15T08:00:00' }],
      inbound: [],
      stops: 0,
      totalDuration: '1h 30m'
    },
    {
      id: 'amadeus-2',
      provider: 'amadeus',
      price: 120,
      currency: 'EUR',
      outbound: [{ origin: 'MAD', destination: 'BCN', departure: '2026-03-15T14:00:00' }],
      inbound: [],
      stops: 0,
      totalDuration: '1h 25m'
    }
  ])
}));

jest.mock('../../providers/kiwi.provider', () => ({
  search: jest.fn().mockResolvedValue([
    {
      id: 'kiwi-1',
      provider: 'kiwi',
      price: 79,
      currency: 'EUR',
      outbound: [{ origin: 'MAD', destination: 'BCN', departure: '2026-03-15T10:00:00' }],
      inbound: [],
      stops: 0,
      totalDuration: '1h 30m'
    }
  ])
}));

jest.mock('../../providers/rate-limiter', () => ({
  canMakeRequest: jest.fn().mockResolvedValue(true),
  trackRequest: jest.fn().mockResolvedValue(undefined)
}));

const aggregator = require('../../providers/aggregator');

describe('Aggregator', () => {
  test('combines results from multiple providers sorted by price', async () => {
    const { results, providers } = await aggregator.searchAll({
      origin: 'MAD',
      destination: 'BCN',
      departureDate: '2026-03-15'
    });

    expect(providers).toContain('amadeus');
    expect(providers).toContain('kiwi');
    expect(results.length).toBeGreaterThanOrEqual(2);
    // Should be sorted by price
    for (let i = 1; i < results.length; i++) {
      expect(results[i].price).toBeGreaterThanOrEqual(results[i - 1].price);
    }
  });

  test('returns results even if one provider fails', async () => {
    const kiwi = require('../../providers/kiwi.provider');
    kiwi.search.mockRejectedValueOnce(new Error('Kiwi API down'));

    const { results, errors } = await aggregator.searchAll({
      origin: 'MAD',
      destination: 'BCN',
      departureDate: '2026-03-15'
    });

    expect(results.length).toBeGreaterThan(0);
    expect(errors.some(e => e.includes('kiwi'))).toBe(true);
  });
});
