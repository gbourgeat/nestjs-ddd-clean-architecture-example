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
      throw new Error('Le nom de la ville ne peut pas être vide');
    }

    const trimmedName = name.trim();

    // Seem weird but in France we have city name Y (Somme)
    if (!trimmedName.length) {
      throw new Error('Le nom de la ville doit contenir au moins 1 caractères');
    }

    if (trimmedName.length > 100) {
      throw new Error('Le nom de la ville ne peut pas dépasser 100 caractères');
    }

    // Ensure name doesn't start or end with special characters (except balanced parentheses)
    if (/^[\s\-']|[\s\-']$/.test(trimmedName)) {
      throw new Error(
        'Le nom de la ville ne peut pas commencer ou se terminer par un espace, un tiret, une apostrophe ou une parenthèse',
      );
    }

    // Check for mismatched parentheses
    const openParens = (trimmedName.match(/\(/g) || []).length;
    const closeParens = (trimmedName.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      throw new Error('Les parenthèses doivent être équilibrées');
    }

    // If there are parentheses, they shouldn't be at the very start
    if (/^\(/.test(trimmedName)) {
      throw new Error(
        'Le nom de la ville ne peut pas commencer ou se terminer par un espace, un tiret, une apostrophe ou une parenthèse',
      );
    }

    // Avoid multiple consecutive spaces or hyphens
    if (/\s{2,}|--/.test(trimmedName)) {
      throw new Error(
        'Le nom de la ville ne peut pas contenir plusieurs espaces ou tirets consécutifs',
      );
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
      throw new Error(
        'Le nom de la ville contient des caractères invalides. Seuls les lettres (avec accents), espaces, tirets, apostrophes et parenthèses sont autorisés',
      );
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
