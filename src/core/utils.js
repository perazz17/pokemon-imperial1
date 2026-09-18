/** Shared pure helpers used by the extracted V78 engine. */
export const clone = value => JSON.parse(JSON.stringify(value));
export const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
