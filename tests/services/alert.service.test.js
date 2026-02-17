jest.mock('../../models', () => {
  const alerts = [];
  return {
    Alert: {
      create: jest.fn().mockImplementation((data) => {
        const alert = { id: 1, ...data, active: true };
        alerts.push(alert);
        return Promise.resolve(alert);
      }),
      findAll: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      destroy: jest.fn().mockResolvedValue(1)
    },
    User: {}
  };
});

jest.mock('../../services/search.service', () => ({
  searchFlights: jest.fn().mockResolvedValue({ results: [] })
}));

jest.mock('../../services/notification.service', () => ({
  sendPriceAlert: jest.fn().mockResolvedValue(undefined)
}));

const alertService = require('../../services/alert.service');
const { Alert } = require('../../models');

describe('Alert Service', () => {
  test('createAlert creates an alert with correct data', async () => {
    const alert = await alertService.createAlert(1, {
      origin: 'MAD',
      destination: 'BCN',
      departureDate: '2026-03-15',
      targetPrice: 100,
      currency: 'EUR'
    });

    expect(Alert.create).toHaveBeenCalled();
    expect(alert.origin).toBe('MAD');
    expect(alert.destination).toBe('BCN');
    expect(alert.target_price).toBe(100);
  });

  test('deleteAlert calls destroy with correct params', async () => {
    const result = await alertService.deleteAlert(1, 1);
    expect(Alert.destroy).toHaveBeenCalledWith({
      where: { id: 1, user_id: 1 }
    });
    expect(result).toBe(true);
  });
});
