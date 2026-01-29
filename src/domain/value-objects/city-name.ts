import { InvalidCityNameError } from '@/domain/errors';

export class CityName {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(name: string): CityName {
    CityName.validate(name);

    return new CityName(name.trim());
  }

  private static validate(name: string): void {
    if (!name || name.trim().length === 0) {
      throw InvalidCityNameError.empty();
    }

    const trimmedName = name.trim();

    if (trimmedName.length > 100) {
      throw InvalidCityNameError.tooLong();
    }

    // Ensure name doesn't start or end with special characters (except balanced parentheses)
    if (/^[\s\-']|[\s\-']$/.test(trimmedName)) {
      throw InvalidCityNameError.invalidFormat();
    }

    // Check for mismatched parentheses
    const openParens = (trimmedName.match(/\(/g) || []).length;
    const closeParens = (trimmedName.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      throw InvalidCityNameError.mismatchedParentheses();
    }

    // If there are parentheses, they shouldn't be at the very start
    if (/^\(/.test(trimmedName)) {
      throw InvalidCityNameError.invalidFormat();
    }

    // Avoid multiple consecutive spaces or hyphens
    if (/\s{2,}|--/.test(trimmedName)) {
      throw InvalidCityNameError.invalidFormat();
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
      throw InvalidCityNameError.invalidCharacters();
    }
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
