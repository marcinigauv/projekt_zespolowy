export interface NotificationDto {
  message: string
  url?: string
  expiresAt?: string
}

const notificationsEndpoint = '/notifications'
const mockNotifications: NotificationDto[] = [
  {
    message: 'Nowy produkt pojawił się w katalogu promocji.',
    url: '/products/1',
    expiresAt: '2026-12-31T23:59:59.000Z',
  },
  {
    message: 'Sprawdź status ostatniego zamówienia.',
    url: '/orders',
    expiresAt: '2026-12-31T23:59:59.000Z',
  },
  {
    message: 'Dokumentacja płatności jest dostępna pod zewnętrznym linkiem.',
    url: 'https://example.com/payments',
    expiresAt: '2026-12-31T23:59:59.000Z',
  },
]

export async function getNotificationsApi(): Promise<NotificationDto[]> {
  void notificationsEndpoint
  return Promise.resolve(mockNotifications)
}