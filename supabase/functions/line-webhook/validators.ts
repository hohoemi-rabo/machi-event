/**
 * LINE Webhook署名検証
 * @param body - リクエストボディ
 * @param signature - x-line-signature ヘッダーの値
 * @param channelSecret - LINEチャネルシークレット
 * @returns 署名が有効な場合true
 */
export async function validateSignature(
  body: string,
  signature: string | null,
  channelSecret: string
): Promise<boolean> {
  if (!signature) {
    return false
  }

  // Web Crypto APIを使用してHMAC-SHA256を計算
  const encoder = new TextEncoder()
  const keyData = encoder.encode(channelSecret)
  const messageData = encoder.encode(body)

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signatureBuffer = await crypto.subtle.sign('HMAC', key, messageData)

  // Base64エンコード
  const signatureArray = Array.from(new Uint8Array(signatureBuffer))
  const hash = btoa(String.fromCharCode(...signatureArray))

  return hash === signature
}
