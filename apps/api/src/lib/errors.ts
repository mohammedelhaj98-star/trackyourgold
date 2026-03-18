export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
  }
}

export function toErrorPayload(error: unknown) {
  if (error instanceof ApiError) {
    return {
      statusCode: error.statusCode,
      payload: {
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        }
      }
    };
  }

  return {
    statusCode: 500,
    payload: {
      error: {
        code: "internal_error",
        message: error instanceof Error ? error.message : "Unexpected error"
      }
    }
  };
}
