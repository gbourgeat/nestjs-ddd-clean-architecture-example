# Create Endpoint

Create a new REST API endpoint with controller, DTOs, and wire up with use case.

## Arguments

$ARGUMENTS - HTTP method and path (e.g., "POST /cities" or "GET /weather/:city")

## Instructions

Parse the arguments to extract:
- HTTP method (GET, POST, PATCH, PUT, DELETE)
- Resource path
- Path parameters (if any)

Create the following files:

### 1. Request DTO (for POST/PATCH/PUT)

`src/presentation/rest-api/requests/${resource}.request.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class ${PascalCase}Request {
  @ApiProperty({ description: 'Description', example: 'example' })
  @IsNotEmpty()
  @IsString()
  field: string;
}
```

### 2. Response DTO

`src/presentation/rest-api/responses/${resource}.response.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class ${PascalCase}Response {
  @ApiProperty({ description: 'Description', example: 'example' })
  field: string;
}
```

### 3. Controller

`src/presentation/rest-api/controllers/${resource}.controller.ts`

```typescript
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ${UseCase}UseCase } from '@/application/use-cases';
import { ${PascalCase}Request } from '../requests/${resource}.request';
import { ${PascalCase}Response } from '../responses/${resource}.response';

@ApiTags('${resource}')
@Controller()
export class ${PascalCase}Controller {
  constructor(private readonly useCase: ${UseCase}UseCase) {}

  @Post('${path}')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Description' })
  @ApiResponse({ status: 201, type: ${PascalCase}Response })
  async handle(@Body() request: ${PascalCase}Request): Promise<${PascalCase}Response> {
    const output = await this.useCase.execute({
      // map request to input
    });
    return {
      // map output to response
    };
  }
}
```

### 4. Update Module

Add controller to `src/presentation/rest-api/rest-api.module.ts`

### 5. Update Barrel Exports

- `src/presentation/rest-api/controllers/index.ts`
- `src/presentation/rest-api/requests/index.ts`
- `src/presentation/rest-api/responses/index.ts`

## Error Handling

Add error handling for domain errors:

```typescript
import { CityNotFoundError } from '@/domain/errors';
import { NotFoundException, BadRequestException } from '@nestjs/common';

// In controller method:
try {
  const output = await this.useCase.execute(input);
  return output;
} catch (error) {
  if (error instanceof CityNotFoundError) {
    throw new NotFoundException(error.message);
  }
  throw error;
}
```

## Rules

- Controllers only transform DTOs to use case inputs and outputs to responses
- No business logic in controllers
- Use class-validator for request validation
- Use Swagger decorators for API documentation
- Handle domain errors and map to HTTP exceptions