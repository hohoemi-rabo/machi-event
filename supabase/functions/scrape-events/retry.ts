import { ScrapingError } from './error-types.ts'

/**
 * 指数バックオフを使用したリトライ機能
 *
 * @param fn 実行する関数
 * @param maxRetries 最大リトライ回数（デフォルト: 3）
 * @param baseDelay 基本遅延時間（ミリ秒、デフォルト: 1000）
 * @returns 関数の実行結果
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1}/${maxRetries}`)
      return await fn()
    } catch (error) {
      lastError = error as Error

      // リトライ可能かチェック
      if (!isRetryable(error)) {
        console.log('Error is not retryable, throwing immediately')
        throw error
      }

      // 最後の試行の場合はエラーを投げる
      if (attempt === maxRetries - 1) {
        console.log('Max retries reached, throwing error')
        throw error
      }

      // 指数バックオフで待機
      const delay = calculateBackoffDelay(attempt, baseDelay)
      console.log(`Retrying after ${delay}ms...`)
      await sleep(delay)
    }
  }

  // この行に到達することはないが、TypeScriptの型チェックのため
  throw lastError || new Error('Max retries reached')
}

/**
 * エラーがリトライ可能かどうかを判定
 *
 * @param error エラーオブジェクト
 * @returns リトライ可能な場合true
 */
export function isRetryable(error: unknown): boolean {
  // ScrapingErrorの場合、retryableフラグをチェック
  if (error instanceof ScrapingError) {
    return error.isRetryable()
  }

  // 一般的なエラーの場合、メッセージから判断
  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    // タイムアウトやネットワークエラーはリトライ可能
    if (
      message.includes('timeout') ||
      message.includes('fetch failed') ||
      message.includes('network') ||
      message.includes('econnrefused') ||
      message.includes('enotfound') ||
      message.includes('etimedout')
    ) {
      return true
    }

    // 5xx系のHTTPエラーはリトライ可能
    if (message.includes('http error! status: 5')) {
      return true
    }

    // 429 (Too Many Requests) もリトライ可能
    if (message.includes('http error! status: 429')) {
      return true
    }
  }

  // デフォルトはリトライしない
  return false
}

/**
 * 指数バックオフの遅延時間を計算
 *
 * @param attempt 試行回数（0から開始）
 * @param baseDelay 基本遅延時間（ミリ秒）
 * @param maxDelay 最大遅延時間（ミリ秒、デフォルト: 30000）
 * @returns 遅延時間（ミリ秒）
 */
function calculateBackoffDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number = 30000
): number {
  // 指数バックオフ: delay = baseDelay * (2 ^ attempt)
  const delay = baseDelay * Math.pow(2, attempt)

  // ジッター（ランダムな揺らぎ）を追加して、同時リトライの衝突を避ける
  const jitter = Math.random() * 0.1 * delay // 0-10%のランダムな揺らぎ

  // 最大遅延時間を超えないようにする
  return Math.min(delay + jitter, maxDelay)
}

/**
 * 指定時間待機
 *
 * @param ms 待機時間（ミリ秒）
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * タイムアウト付きでfetchを実行
 *
 * @param url リクエストURL
 * @param timeout タイムアウト時間（ミリ秒、デフォルト: 10000）
 * @param options fetchオプション
 * @returns レスポンス
 */
export async function fetchWithTimeout(
  url: string,
  timeout: number = 10000,
  options?: RequestInit
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })

    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)

    if ((error as Error).name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms: ${url}`)
    }

    throw error
  }
}
