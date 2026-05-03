export function parsePositiveIntParam(value: string | string[] | undefined): number | null {
  if (Array.isArray(value)) {
    return parsePositiveIntParam(value[0])
  }

  if (!value) {
    return null
  }

  const parsedValue = Number(value)

  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : null
}

export function parseBooleanParam(value: string | string[] | undefined): boolean {
  if (Array.isArray(value)) {
    return parseBooleanParam(value[0])
  }

  return value === '1' || value === 'true'
}