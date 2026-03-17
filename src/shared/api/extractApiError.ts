function extractApiError(err: any): {
  message: string;
  code?: string;
  status?: number;
} {
  const d = err?.response?.data;
  if (d && typeof d === 'object') {
    return {
      message: d.message || 'Server error',
      code: d.errorCode || undefined,
      status: d.statusCode || err?.response?.status,
    };
  }
  return {
    message: err?.message || 'Unknown error',
    code: undefined,
    status: err?.response?.status,
  };
}

export default extractApiError;
