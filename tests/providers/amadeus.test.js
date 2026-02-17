const amadeusProvider = require('../../providers/amadeus.provider');

// Mock del SDK de Amadeus
jest.mock('amadeus', () => {
  return jest.fn().mockImplementation(() => ({
    shopping: {
      flightOffersSearch: {
        get: jest.fn().mockResolvedValue({
          body: JSON.stringify({
            data: [
              {
                id: '1',
                price: { total: '85.00', currency: 'EUR' },
                lastTicketingDate: '2026-03-10',
                itineraries: [
                  {
                    duration: 'PT1H30M',
                    segments: [
                      {
                        id: 's1',
                        carrierCode: 'IB',
                        number: '3214',
                        departure: { iataCode: 'MAD', at: '2026-03-15T08:00:00' },
                        arrival: { iataCode: 'BCN', at: '2026-03-15T09:30:00' },
                        duration: 'PT1H30M'
                      }
                    ]
                  }
                ],
                travelerPricings: [
                  {
                    fareDetailsBySegment: [
                      { segmentId: 's1', cabin: 'ECONOMY' }
                    ]
                  }
                ]
              }
            ]
          })
        })
      },
      flightDates: {
        get: jest.fn().mockResolvedValue({
          body: JSON.stringify({
            data: [
              { departureDate: '2026-03-15', price: { total: '75.00', currency: 'EUR' } },
              { departureDate: '2026-03-16', price: { total: '92.00', currency: 'EUR' } }
            ]
          })
        })
      }
    }
  }));
});

describe('Amadeus Provider', () => {
  test('search returns normalized flight offers', async () => {
    const results = await amadeusProvider.search({
      origin: 'MAD',
      destination: 'BCN',
      departureDate: '2026-03-15'
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      id: 'amadeus-1',
      provider: 'amadeus',
      price: 85,
      currency: 'EUR',
      stops: 0
    });
    expect(results[0].outbound).toHaveLength(1);
    expect(results[0].outbound[0].airline).toBe('IB');
    expect(results[0].outbound[0].airlineName).toBe('Iberia');
  });

  test('searchFlexibleDates returns date-price pairs', async () => {
    const results = await amadeusProvider.searchFlexibleDates('MAD', 'BCN');

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      date: '2026-03-15',
      price: 75,
      currency: 'EUR'
    });
  });
});
