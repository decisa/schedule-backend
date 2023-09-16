export type DBErrorMessage =
  | 'Unauthorized'
  | 'Bad Data'
  | 'Not found'
  | 'Network Problem'
  | 'Parsing Error'
  | 'Unknown'

export class DBError extends Error {
  code: number

  constructor(
    message: DBErrorMessage,
    code: number,
    cause: Error | null = null,
  ) {
    let errorMessage = `[Database] ${code} : ${message as string}`
    if (cause instanceof Error) {
      errorMessage += ` - ${cause.message}`
    }
    super(errorMessage)
    this.cause = cause
    this.code = code
  }

  static unauthorized(cause: Error | null = null) {
    return new DBError('Unauthorized', 401, cause)
  }

  static badData(cause: Error | null = null) {
    return new DBError('Bad Data', 400, cause)
  }

  static notFound(cause: Error | null = null) {
    return new DBError('Not found', 404, cause)
  }

  static network(cause: Error | null = null) {
    return new DBError('Network Problem', 888, cause)
  }

  static parseError(cause: Error | null = null) {
    return new DBError('Parsing Error', 899, cause)
  }

  static unknown(cause: Error | null = null) {
    return new DBError('Unknown', 999, cause)
  }
}
