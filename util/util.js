export function isValid(value) {
  return value && value != null && value !== undefined && value !== "";
}

export function isValidArray(array) {
  return Array.isArray(array) && array.every((v) => isValid(v));
}
