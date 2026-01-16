import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class TransformMultipartPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (!value || typeof value !== 'object') {
      return value;
    }

    const transformed = { ...value };

    // Transform boolean strings to actual booleans
    if (transformed.isRoundTrip !== undefined) {
      transformed.isRoundTrip = transformed.isRoundTrip === 'true' || transformed.isRoundTrip === true;
    }

    // Transform numeric strings to numbers
    if (transformed.ticketPrice !== undefined && typeof transformed.ticketPrice === 'string') {
      transformed.ticketPrice = parseFloat(transformed.ticketPrice);
    }

    return transformed;
  }
}
