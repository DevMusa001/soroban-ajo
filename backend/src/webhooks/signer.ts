import crypto from 'crypto'

export class WebhookSigner {
  static sign(payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
  }

  static verify(payload: string, signature: string, secret: string): boolean {
    const expected = this.sign(payload, secret)
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    )
  }
}
