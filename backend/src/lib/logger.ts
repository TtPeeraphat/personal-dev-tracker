/**
 * Centralized logger — ใช้แทน console.error โดยตรง
 * ในอนาคตสามารถเปลี่ยนเป็น winston / pino ได้โดยไม่ต้องแก้ทุกไฟล์
 */
export const logger = {
  error: (context: string, error: unknown) => {
    const message = error instanceof Error ? error.message : String(error)
    const stack   = error instanceof Error ? error.stack   : undefined
    console.error(`[ERROR] ${context}:`, message, stack ?? '')
  },
  info: (message: string) => {
    console.log(`[INFO] ${message}`)
  },
}
