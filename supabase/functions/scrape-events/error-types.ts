/**
 * エラータイプの定義
 */
export enum ErrorType {
  NETWORK = 'network',       // ネットワーク関連エラー（タイムアウト、接続失敗等）
  PARSING = 'parsing',       // パース関連エラー（HTML構造変更、セレクタ不一致等）
  DATABASE = 'database',     // データベース関連エラー（接続失敗、書き込みエラー等）
  VALIDATION = 'validation'  // バリデーションエラー（必須フィールド欠落、不正な日付形式等）
}

/**
 * スクレイピング専用エラークラス
 */
export class ScrapingError extends Error {
  constructor(
    message: string,
    public readonly siteName: string,
    public readonly errorType: ErrorType,
    public readonly retryable: boolean = false
  ) {
    super(message)
    this.name = 'ScrapingError'

    // スタックトレースを適切に設定
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ScrapingError)
    }
  }

  /**
   * エラーがリトライ可能かどうかを判定
   */
  isRetryable(): boolean {
    return this.retryable
  }

  /**
   * エラー情報を構造化して返す
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      siteName: this.siteName,
      errorType: this.errorType,
      retryable: this.retryable,
      stack: this.stack
    }
  }
}

/**
 * ネットワークエラーを作成
 */
export function createNetworkError(siteName: string, message: string): ScrapingError {
  return new ScrapingError(message, siteName, ErrorType.NETWORK, true)
}

/**
 * パースエラーを作成
 */
export function createParsingError(siteName: string, message: string): ScrapingError {
  return new ScrapingError(message, siteName, ErrorType.PARSING, false)
}

/**
 * データベースエラーを作成
 */
export function createDatabaseError(siteName: string, message: string): ScrapingError {
  return new ScrapingError(message, siteName, ErrorType.DATABASE, true)
}

/**
 * バリデーションエラーを作成
 */
export function createValidationError(siteName: string, message: string): ScrapingError {
  return new ScrapingError(message, siteName, ErrorType.VALIDATION, false)
}

/**
 * 一般的なエラーをScrapingErrorに変換
 */
export function toScrapingError(error: unknown, siteName: string): ScrapingError {
  if (error instanceof ScrapingError) {
    return error
  }

  if (error instanceof Error) {
    // エラーメッセージからタイプを推測
    const message = error.message.toLowerCase()

    if (message.includes('timeout') || message.includes('fetch') || message.includes('network')) {
      return createNetworkError(siteName, error.message)
    }

    if (message.includes('parse') || message.includes('selector') || message.includes('html')) {
      return createParsingError(siteName, error.message)
    }

    if (message.includes('database') || message.includes('supabase') || message.includes('insert')) {
      return createDatabaseError(siteName, error.message)
    }

    // デフォルトはネットワークエラー（リトライ可能）
    return createNetworkError(siteName, error.message)
  }

  // 不明なエラー
  return createNetworkError(siteName, String(error))
}
