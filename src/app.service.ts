import { Injectable } from '@nestjs/common'
import { HttpException, HttpStatus } from '@nestjs/common'

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!'
  }

  getData(params): string {
    if (Number(params.id) === 1) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN)
    }
    return 'This action returns all data'
  }
}
