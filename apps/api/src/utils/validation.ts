import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

export function requireString(
  value: unknown,
  fieldName: string,
  options?: {
    minLength?: number;
  },
): string {
  if (typeof value !== 'string') {
    throw new BadRequestException(`${fieldName} is required.`);
  }

  const normalized = value.trim();

  if (!normalized) {
    throw new BadRequestException(`${fieldName} is required.`);
  }

  if (options?.minLength && normalized.length < options.minLength) {
    throw new BadRequestException(
      `${fieldName} must be at least ${options.minLength} characters.`,
    );
  }

  return normalized;
}

export function optionalString(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new BadRequestException('Expected a string value.');
  }

  const normalized = value.trim();
  return normalized ? normalized : undefined;
}

export function requireBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  throw new BadRequestException(`${fieldName} must be true or false.`);
}

export function optionalBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  return requireBoolean(value, 'value');
}

export function requireNumber(value: unknown, fieldName: string): number {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(parsed)) {
    throw new BadRequestException(`${fieldName} must be a valid number.`);
  }

  return Number(parsed.toFixed(2));
}

export function optionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  return requireNumber(value, 'value');
}

export function requireEnum<T extends readonly string[]>(
  value: unknown,
  fieldName: string,
  allowedValues: T,
): T[number] {
  const normalized = requireString(value, fieldName);

  if (!allowedValues.includes(normalized as T[number])) {
    throw new BadRequestException(`${fieldName} has an invalid value.`);
  }

  return normalized as T[number];
}

export function requireDateString(value: unknown, fieldName: string): string {
  const normalized = requireString(value, fieldName);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new BadRequestException(`${fieldName} must be in YYYY-MM-DD format.`);
  }

  return normalized;
}

export function optionalDateString(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  return requireDateString(value, 'value');
}

export function requireArray(value: unknown, fieldName: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new BadRequestException(`${fieldName} must be an array.`);
  }

  return value;
}

export function assertFound<T>(
  value: T | null | undefined,
  message: string,
): T {
  if (!value) {
    throw new NotFoundException(message);
  }

  return value;
}

export function assertConflict(condition: boolean, message: string): void {
  if (condition) {
    throw new ConflictException(message);
  }
}
