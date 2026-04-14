export class InvalidOrderIdError extends Error {
  constructor() {
    super('Nieprawidłowy identyfikator zamówienia')
    this.name = 'InvalidOrderIdError'
  }
}

export class EmptyOrderError extends Error {
  constructor() {
    super('Koszyk jest pusty')
    this.name = 'EmptyOrderError'
  }
}

export class OrderNotFoundError extends Error {
  constructor(orderId?: number) {
    super(
      orderId === undefined
        ? 'Nie znaleziono zamówienia'
        : `Nie znaleziono zamówienia o id ${orderId}`,
    )
    this.name = 'OrderNotFoundError'
  }
}

export class OrdersUnauthorizedError extends Error {
  constructor() {
    super('Musisz się zalogować, aby zobaczyć zamówienia')
    this.name = 'OrdersUnauthorizedError'
  }
}

export class OrderValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OrderValidationError'
  }
}

export class OrderServiceUnavailableError extends Error {
  constructor() {
    super('Usługa zamówień jest chwilowo niedostępna')
    this.name = 'OrderServiceUnavailableError'
  }
}

export class OrderOfflineError extends Error {
  constructor() {
    super('Brak połączenia z serwerem. Sprawdź sieć i spróbuj ponownie.')
    this.name = 'OrderOfflineError'
  }
}