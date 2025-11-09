import { ScrapingError, ErrorType } from './error-types.ts'
import { StructureCheckResult } from './structure-checker.ts'

/**
 * アラートタイプ
 */
export enum AlertType {
  ERROR = 'ERROR',                       // スクレイピングエラー
  STRUCTURE_CHANGE = 'STRUCTURE_CHANGE', // サイト構造変更
  WARNING = 'WARNING'                    // 警告
}

/**
 * アラート情報
 */
export interface Alert {
  type: AlertType
  siteName: string
  message: string
  details?: Record<string, unknown>
  timestamp: string
}

/**
 * エラーアラートを送信
 *
 * @param error スクレイピングエラー
 */
export async function sendErrorAlert(error: ScrapingError): Promise<void> {
  const alert: Alert = {
    type: AlertType.ERROR,
    siteName: error.siteName,
    message: error.message,
    details: {
      errorType: error.errorType,
      retryable: error.retryable,
      stack: error.stack
    },
    timestamp: new Date().toISOString()
  }

  await sendAlert(alert)
}

/**
 * 構造変更アラートを送信
 *
 * @param siteName サイト名
 * @param result 構造変更検知結果
 */
export async function sendStructureChangeAlert(
  siteName: string,
  result: StructureCheckResult
): Promise<void> {
  const alert: Alert = {
    type: AlertType.STRUCTURE_CHANGE,
    siteName,
    message: result.reason || 'Structure change detected',
    details: {
      currentCount: result.currentCount,
      avgCount: result.avgCount
    },
    timestamp: new Date().toISOString()
  }

  await sendAlert(alert)
}

/**
 * アラート通知を実行
 *
 * @param alert アラート情報
 */
async function sendAlert(alert: Alert): Promise<void> {
  console.log(`[ALERT] ${alert.type}: ${alert.siteName} - ${alert.message}`)

  // 環境変数からアラート設定を取得
  const slackWebhookUrl = Deno.env.get('SLACK_WEBHOOK_URL')
  const adminEmail = Deno.env.get('ADMIN_EMAIL')

  // Slack通知
  if (slackWebhookUrl) {
    try {
      await sendSlackNotification(slackWebhookUrl, alert)
      console.log('Slack notification sent successfully')
    } catch (error) {
      console.error('Failed to send Slack notification:', error)
    }
  }

  // メール通知（将来実装）
  if (adminEmail) {
    try {
      // TODO: Supabase Auth経由でメール送信を実装
      console.log(`Email notification would be sent to: ${adminEmail}`)
      // await sendEmailNotification(adminEmail, alert)
    } catch (error) {
      console.error('Failed to send email notification:', error)
    }
  }

  // アラートが設定されていない場合は警告
  if (!slackWebhookUrl && !adminEmail) {
    console.warn('No alert channels configured (SLACK_WEBHOOK_URL or ADMIN_EMAIL)')
  }
}

/**
 * Slack通知を送信
 *
 * @param webhookUrl Slack Webhook URL
 * @param alert アラート情報
 */
async function sendSlackNotification(
  webhookUrl: string,
  alert: Alert
): Promise<void> {
  const emoji = getAlertEmoji(alert.type)
  const color = getAlertColor(alert.type)

  const payload = {
    text: `${emoji} *${alert.type}*: ${alert.siteName}`,
    attachments: [
      {
        color,
        fields: [
          {
            title: 'Site',
            value: alert.siteName,
            short: true
          },
          {
            title: 'Time',
            value: new Date(alert.timestamp).toLocaleString('ja-JP', {
              timeZone: 'Asia/Tokyo'
            }),
            short: true
          },
          {
            title: 'Message',
            value: alert.message,
            short: false
          },
          ...(alert.details ? [
            {
              title: 'Details',
              value: '```' + JSON.stringify(alert.details, null, 2) + '```',
              short: false
            }
          ] : [])
        ]
      }
    ]
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error(`Slack API error: ${response.status} ${response.statusText}`)
  }
}

/**
 * アラートタイプに対応する絵文字を取得
 *
 * @param type アラートタイプ
 * @returns 絵文字
 */
function getAlertEmoji(type: AlertType): string {
  switch (type) {
    case AlertType.ERROR:
      return '🚨'
    case AlertType.STRUCTURE_CHANGE:
      return '⚠️'
    case AlertType.WARNING:
      return '⚡'
    default:
      return 'ℹ️'
  }
}

/**
 * アラートタイプに対応する色を取得（Slack用）
 *
 * @param type アラートタイプ
 * @returns 色コード
 */
function getAlertColor(type: AlertType): string {
  switch (type) {
    case AlertType.ERROR:
      return 'danger' // 赤
    case AlertType.STRUCTURE_CHANGE:
      return 'warning' // 黄
    case AlertType.WARNING:
      return '#FFA500' // オレンジ
    default:
      return '#36A64F' // 緑
  }
}
