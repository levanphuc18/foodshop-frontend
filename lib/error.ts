type ErrorWithMessage = {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
};

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const typedError = error as ErrorWithMessage;
    if (typedError.response?.data?.message) {
      return typedError.response.data.message;
    }
    if (typedError.message) {
      return typedError.message;
    }
  }

  return fallback;
}
