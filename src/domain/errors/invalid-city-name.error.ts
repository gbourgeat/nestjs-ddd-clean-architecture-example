export class InvalidCityNameError extends Error {
  private constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  static empty(): InvalidCityNameError {
    return new InvalidCityNameError('City name cannot be empty');
  }

  static tooShort(): InvalidCityNameError {
    return new InvalidCityNameError(
      'City name must contain at least 1 character',
    );
  }

  static tooLong(): InvalidCityNameError {
    return new InvalidCityNameError('City name cannot exceed 100 characters');
  }

  static invalidFormat(): InvalidCityNameError {
    return new InvalidCityNameError(
      'City name cannot start or end with a space, hyphen, apostrophe, or parenthesis',
    );
  }

  static mismatchedParentheses(): InvalidCityNameError {
    return new InvalidCityNameError(
      'City name contains unbalanced parentheses',
    );
  }

  static invalidCharacters(): InvalidCityNameError {
    return new InvalidCityNameError(
      'City name contains unauthorized characters',
    );
  }
}
