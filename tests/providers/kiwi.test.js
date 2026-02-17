const kiwiProvider = require('../../providers/kiwi.provider');

jest.mock('axios', () => ({
  get: jest.fn().mockResolvedValue({
    data: {
      data: [
        {
          id: 'abc123',
          price: 79,
          currency: 'EUR',
          duration: { departure: 5400 },
          route: [
            {
              airline: 'FR',
              flight_no: 1234,
              flyFrom: 'MAD',
              flyTo: 'BCN',
              dTime: Math.floor(new Date('2026-03-15T10:00:00Z').getTime() / 1000),
              aTime: Math.floor(new Date('2026-03-15T11:30:00Z').getTime() / 1000),
              fare_category: 'M',
              return: 0
            }
          ],
          deep_link: 'https://kiwi.com/booking/abc123'
        }
      ]
    }
  })
}));

describe('Kiwi Provider', () => {
  test('search returns normalized flight offers', async () => {
    const results = await kiwiProvider.search({
      origin: 'MAD',
      destination: 'BCN',
      departureDate: '2026-03-15'
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      id: 'kiwi-abc123',
      provider: 'kiwi',
      price: 79,
      currency: 'EUR',
      stops: 0
    });
    expect(results[0].outbound).toHaveLength(1);
    expect(results[0].outbound[0].airline).toBe('FR');
    expect(results[0].deepLink).toBe('https://kiwi.com/booking/abc123');
  });
});
