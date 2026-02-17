jest.mock('../../providers/aggregator', () => ({
  searchAll: jest.fn().mockResolvedValue({
    results: [
      { id: 'test-1', price: 85, currency: 'EUR', stops: 0 },
      { id: 'test-2', price: 120, currency: 'EUR', stops: 1 }
    ],
    providers: ['amadeus'],
    errors: []
  })
}));

jest.mock('../../models', () => ({
  SearchCache: {
    findOne: jest.fn().mockResolvedValue(null),
    upsert: jest.fn().mockResolvedValue([{}, true])
  }
}));

jest.mock('../../services/price-tracker.service', () => ({
  recordPrices: jest.fn().mockResolvedValue(undefined)
}));

jest.mock('node-cache', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn().mockReturnValue(undefined),
    set: jest.fn()
  }));
});

const searchService = require('../../services/search.service');

describe('Search Service', () => {
  test('returns search results with metadata', async () => {
    const result = await searchService.searchFlights({
      origin: 'MAD',
      destination: 'BCN',
      departureDate: '2026-03-15'
    });

    expect(result.results).toHaveLength(2);
    expect(result.totalResults).toBe(2);
    expect(result.providers).toContain('amadeus');
    expect(result.cached).toBe(false);
  });
});
