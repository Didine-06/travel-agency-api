export function ApiResponse<T>(
  data: T = null,
  message = '',
  resultInfo: any = null,
) {
  return {
    data,
    resultInfo,
    isSuccess: true,
    isError: false,
    message,
  };
}

export function ErrorResponse(error: string, errorDetails: any = null) {
  return {
    isSuccess: false,
    isError: true,
    error,
    errorDetails,
  };
}
