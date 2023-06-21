import { APIGatewayProxyResult } from 'aws-lambda';
import { logger } from '@shared/logger';

// we would typically use middy - but to keep this simple to read
// without mutliple additional packages lets build outselves
export function errorHandler(error: Error | unknown): APIGatewayProxyResult {
  console.error(error);

  let errorMessage: string;
  let statusCode: number;

  if (error instanceof Error) {
    switch (error.name) {
      case 'OverAgreedLimit': // note: this is our error type we want to alert on
      case 'ValidationError':
        errorMessage = error.message;
        statusCode = 400;
        break;
      case 'ResourceNotFound':
        errorMessage = error.message;
        statusCode = 404;
        break;
      default:
        errorMessage = 'An error has occurred';
        statusCode = 500;
        break;
    }
    logger.error(errorMessage, {
      errorName: error.name, // these additional props in the logs allow us to filter them
      statusCode,
    });
  } else {
    errorMessage = 'An error has occurred';
    statusCode = 500;

    logger.error(errorMessage, {
      errorName: 'UnknownError',
      statusCode,
    });
  }

  return {
    statusCode: statusCode,
    body: JSON.stringify({
      message: errorMessage,
    }),
  };
}
