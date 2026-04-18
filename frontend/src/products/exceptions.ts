export class InvalidProductListInputError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidProductListInputError'
  }
}

export class InvalidProductIdError extends Error {
  constructor() {
    super('Nieprawidłowy identyfikator produktu')
    this.name = 'InvalidProductIdError'
  }
}

export class ProductNotFoundError extends Error {
  constructor(productId?: number) {
    super(
      productId === undefined
        ? 'Nie znaleziono produktu'
        : `Nie znaleziono produktu o id ${productId}`,
    )
    this.name = 'ProductNotFoundError'
  }
}

export class ProductServiceUnavailableError extends Error {
  constructor() {
    super('Usługa produktów jest chwilowo niedostępna')
    this.name = 'ProductServiceUnavailableError'
  }
}

export class ProductOfflineError extends Error {
  constructor() {
    super('Brak połączenia z serwerem. Sprawdź sieć i spróbuj ponownie.')
    this.name = 'ProductOfflineError'
  }
}

export class InvalidProductInputError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidProductInputError'
  }
}

export class ProductForbiddenError extends Error {
  constructor() {
    super('Nie masz uprawnień do zarządzania produktami')
    this.name = 'ProductForbiddenError'
  }
}