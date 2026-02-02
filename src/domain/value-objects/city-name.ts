import { type Result, fail, ok } from '@/domain/common';
import { InvalidCityNameError } from '@/domain/errors';

export class CityName {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(name: string): Result<CityName, InvalidCityNameError> {
    const error = CityName.validate(name);
    if (error) {
      return fail(error);
    }
    return ok(new CityName(name.trim()));
  }

  static createOrThrow(name: string): CityName {
    const result = CityName.create(name);
    if (!result.success) {
      throw result.error;
    }
    return result.value;
  }

  private static validate(name: string): InvalidCityNameError | null {
    if (!name || name.trim().length === 0) {
      return InvalidCityNameError.empty();
    }

    const trimmedName = name.trim();

    if (trimmedName.length > 100) {
      return InvalidCityNameError.tooLong();
    }

    // Ensure name doesn't start or end with special characters (except balanced parentheses)
    if (/^[\s\-']|[\s\-']$/.test(trimmedName)) {
      return InvalidCityNameError.invalidFormat();
    }

    // Check for mismatched parentheses
    const openParens = (trimmedName.match(/\(/g) || []).length;
    const closeParens = (trimmedName.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      return InvalidCityNameError.mismatchedParentheses();
    }

    // If there are parentheses, they shouldn't be at the very start
    if (/^\(/.test(trimmedName)) {
      return InvalidCityNameError.invalidFormat();
    }

    // Avoid multiple consecutive spaces or hyphens
    if (/\s{2,}|--/.test(trimmedName)) {
      return InvalidCityNameError.invalidFormat();
    }

    // French city name pattern:
    // - Letters (including accented: é, è, ê, à, ô, etc.)
    // - Spaces (for multi-word cities like "Saint Martin")
    // - Hyphens (for cities like "Saint-Denis", "Aix-en-Provence")
    // - Apostrophes (for cities like "L'Haÿ-les-Roses")
    // - Parentheses (for disambiguation like "Neuilly (Aisne)")
    // Must start with an uppercase letter
    const frenchCityNamePattern =
      /^[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸŒ][a-zA-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿŒœ\s'\-()]*$/;

    if (!frenchCityNamePattern.test(trimmedName)) {
      return InvalidCityNameError.invalidCharacters();
    }

    return null;
  }

  get value(): string {
    return this._value;
  }

  equals(other: CityName): boolean {
    return this._value === other._value;
  }

  compareTo(other: CityName): number {
    return this._value.localeCompare(other._value, 'fr-FR', {
      sensitivity: 'base',
    });
  }

  toNormalized(): string {
    return this._value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/['\-\s()]/g, ''); // Remove special chars
  }

  toString(): string {
    return this._value;
  }
}
