export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: Array<{ field: string; message: string }>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Data tidak ditemukan') { super(404, message); this.name = 'NotFoundError'; }
}
