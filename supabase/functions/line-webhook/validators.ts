import { createHmac } from 'node:crypto'

/**
 * LINE Webhook署名検証
 * @param body - リクエストボディ
 * @param signature - x-line-signature ヘッダーの値
 * @param channelSecret - LINEチャネルシークレット
 * @returns 署名が有効な場合true
 */
export function validateSignature(
  body: string,
  signature: string | null,
  channelSecret: string
): boolean {
  if (!signature) {
    return false
  }

  const hash = createHmac('sha256', channelSecret)
    .update(body)
    .digest('base64')

  return hash === signature
}
