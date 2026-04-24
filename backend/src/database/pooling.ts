import { Pool } from 'pg'

export class ConnectionPool {
  private static pool: Pool

  static initialize() {
    this.pool = new Pool({
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err)
    })

    return this.pool
  }

  static getPool() {
    if (!this.pool) {
      this.initialize()
    }
    return this.pool
  }

  static async close() {
    if (this.pool) {
      await this.pool.end()
    }
  }
}
