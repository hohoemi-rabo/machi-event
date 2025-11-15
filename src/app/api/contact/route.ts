import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    // バリデーション
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: '全ての項目を入力してください' },
        { status: 400 }
      )
    }

    // メール送信
    const data = await resend.emails.send({
      from: 'お問い合わせフォーム <onboarding@resend.dev>', // Resendの検証済みドメインに変更してください
      to: [process.env.CONTACT_EMAIL || 'your-email@example.com'], // 受信先メールアドレス
      replyTo: email,
      subject: `【南信イベナビ】${subject}`,
      html: `
        <h2>お問い合わせがありました</h2>
        <p><strong>お名前:</strong> ${name}</p>
        <p><strong>メールアドレス:</strong> ${email}</p>
        <p><strong>件名:</strong> ${subject}</p>
        <hr />
        <h3>お問い合わせ内容:</h3>
        <p>${message.replace(/\n/g, '<br />')}</p>
      `
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json(
      { message: 'メール送信に失敗しました' },
      { status: 500 }
    )
  }
}
