import { CreateRoadSegmentRequest } from '@/presentation/rest-api/requests';
import { UpdateRoadSegmentSpeedRequest } from '@/presentation/rest-api/requests';
import { CreateRoadSegmentResponse } from '@/presentation/rest-api/responses';
import { UpdateRoadSegmentSpeedResponse } from '@/presentation/rest-api/responses';
import {
  ApiBodyOptions,
  ApiOperationOptions,
  ApiParamOptions,
  ApiResponseOptions,
} from '@nestjs/swagger';

// Example UUID for documentation consistency
const EXAMPLE_UUID = '550e8400-e29b-41d4-a716-446655440000';

// =============================================================================
// CREATE ROAD SEGMENT
// =============================================================================

export const createRoadSegmentOperation: ApiOperationOptions = {
  summary: 'Create a new road segment between two cities',
  description: `
Creates a bidirectional road connection between two cities in the network.

## Prerequisites
- Both cities must already exist in the database
- Both cities must be different (no self-loops allowed)

## Business rules
- **Distance**: Must be a positive number representing kilometers
- **Speed limit**: Speed limit in km/h (must be positive)
- **Identifier**: Automatically generated UUID

## Bidirectionality
The created segment is bidirectional: a Paris-Lyon segment allows travel from Paris to Lyon AND from Lyon to Paris.

## Example
\`\`\`json
POST /road-segments
{
  "cityA": "Paris",
  "cityB": "Lyon",
  "distance": 465,
  "speedLimit": 130
}
\`\`\`
  `,
};

export const createRoadSegmentBody: ApiBodyOptions = {
  type: CreateRoadSegmentRequest,
  description: 'Road segment data to create',
  examples: {
    highway: {
      summary: 'Paris-Lyon Highway',
      description: 'Typical highway segment with 130 km/h speed limit',
      value: {
        cityA: 'Paris',
        cityB: 'Lyon',
        distance: 465,
        speedLimit: 130,
      },
    },
    nationalRoad: {
      summary: 'National road',
      description: 'National road with 80 km/h speed limit',
      value: {
        cityA: 'Dijon',
        cityB: 'Beaune',
        distance: 45,
        speedLimit: 80,
      },
    },
  },
};

export const createRoadSegmentResponses: Record<number, ApiResponseOptions> = {
  201: {
    description:
      'Road segment created successfully. Returns segment information including its unique identifier.',
    type: CreateRoadSegmentResponse,
    example: {
      roadSegmentId: EXAMPLE_UUID,
      cityA: 'Lyon',
      cityB: 'Paris',
      distance: 465,
      speedLimit: 130,
    },
  },
  400: {
    description: `
Invalid request. Possible causes:
- Negative or zero distance
- Negative or zero speed
- Empty city name
- Attempt to create a segment connecting a city to itself
    `,
    schema: {
      oneOf: [
        {
          example: {
            statusCode: 400,
            message: 'Distance must be positive',
            error: 'Invalid Distance',
          },
        },
        {
          example: {
            statusCode: 400,
            message: 'Cannot create a road segment connecting a city to itself',
            error: 'Invalid Road Segment',
          },
        },
      ],
    },
  },
  404: {
    description:
      'One of the specified cities does not exist in the database. Check the spelling or create the city first.',
    schema: {
      example: {
        statusCode: 404,
        message: 'City with name "Pariss" not found',
        error: 'City Not Found',
      },
    },
  },
  500: {
    description:
      'Internal server error. Contact support if the problem persists.',
    schema: {
      example: {
        statusCode: 500,
        message: 'Failed to save road segment',
        error: 'Internal Server Error',
      },
    },
  },
};

// =============================================================================
// UPDATE ROAD SEGMENT SPEED
// =============================================================================

export const updateRoadSegmentSpeedOperation: ApiOperationOptions = {
  summary: 'Update the speed limit of a road segment',
  description: `
Updates the speed limit of an existing road segment.

## Identifier format
The segment identifier is a UUID.

## Use cases
- Update following road construction
- Regulatory changes
- Seasonal adjustments (winter conditions)

## Example
\`\`\`
PATCH /road-segments/${EXAMPLE_UUID}
{
  "newSpeedLimit": 110
}
\`\`\`
  `,
};

export const updateRoadSegmentSpeedParam: ApiParamOptions = {
  name: 'id',
  required: true,
  description: 'Unique identifier (UUID) of the road segment.',
  example: EXAMPLE_UUID,
};

export const updateRoadSegmentSpeedBody: ApiBodyOptions = {
  type: UpdateRoadSegmentSpeedRequest,
  description: 'New speed limit to apply',
  examples: {
    highway: {
      summary: 'Standard highway speed',
      description: 'Typical speed limit on French highways',
      value: {
        newSpeedLimit: 130,
      },
    },
    construction: {
      summary: 'Construction zone reduction',
      description: 'Temporarily reduced speed for road construction',
      value: {
        newSpeedLimit: 90,
      },
    },
    weather: {
      summary: 'Degraded weather conditions',
      description: 'Speed adapted to winter conditions',
      value: {
        newSpeedLimit: 110,
      },
    },
  },
};

export const updateRoadSegmentSpeedResponses: Record<
  number,
  ApiResponseOptions
> = {
  200: {
    description:
      'Speed limit updated successfully. Returns the segment with its new configuration.',
    type: UpdateRoadSegmentSpeedResponse,
    example: {
      roadSegmentId: EXAMPLE_UUID,
      cityA: 'Lyon',
      cityB: 'Paris',
      distance: 465,
      speedLimit: 110,
    },
  },
  400: {
    description: `
Invalid request. Possible causes:
- Invalid UUID format
- Negative or zero speed
- Non-numeric speed value
    `,
    schema: {
      oneOf: [
        {
          example: {
            statusCode: 400,
            message: 'Speed must be positive',
            error: 'Invalid Speed',
          },
        },
        {
          example: {
            statusCode: 400,
            message: 'Invalid road segment ID format. Expected a valid UUID.',
            error: 'Invalid Road Segment ID',
          },
        },
      ],
    },
  },
  404: {
    description: 'The specified road segment does not exist.',
    schema: {
      example: {
        statusCode: 404,
        message: `Road segment with id "${EXAMPLE_UUID}" not found`,
        error: 'Road Segment Not Found',
      },
    },
  },
  500: {
    description:
      'Internal server error. Contact support if the problem persists.',
    schema: {
      example: {
        statusCode: 500,
        message: 'Failed to update road segment',
        error: 'Internal Server Error',
      },
    },
  },
};
