import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Health')
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Check that the API is running' })
  @ApiResponse({
    status: 200,
    description: 'API health response',
    schema: { example: 'Hello World!' },
  })
  getHello(): string {
    return 'Hello World!';
  }
}
