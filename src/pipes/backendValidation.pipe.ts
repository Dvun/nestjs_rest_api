import { ArgumentMetadata, HttpException, HttpStatus, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

export class BackendValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    const obj = plainToInstance(metadata.metatype, value)
    const errors = await validate(obj)
    if (errors.length === 0) return value;
    throw new HttpException({errors: this.formatErrors(errors)}, HttpStatus.UNPROCESSABLE_ENTITY)
  }

  formatErrors(errors: ValidationError[]) {
    return errors.reduce((acc, err) => {
      acc[err.property] = Object.values(err.constraints)
      return acc
    }, {})
  }

}