/**
 * scripts/seedAdmin.ts
 *
 * Standalone script to seed the initial admin account.
 * Run once on first deployment (or whenever the admin account needs to be re-created).
 *
 * Usage:
 *   npm run seed:admin
 *   (or)  npx ts-node src/scripts/seedAdmin.ts
 *
 * Required env vars (in backend/.env):
 *   MONGO_URI      — MongoDB connection string
 *   ADMIN_EMAIL    — Admin email (default: admin@devtrack.local)
 *   ADMIN_PASSWORD — Admin password (default: none — must be set explicitly in prod)
 *   JWT_SECRET     — JWT signing secret
 */

import dotenv from 'dotenv'
import path from 'path'

// Load .env from backend root (two levels up from src/scripts/)
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

import mongoose from 'mongoose'
import { User } from '../models/user'

const ADMIN_EMAIL    = (process.env.ADMIN_EMAIL    || '').toLowerCase()
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''

async function main() {
  // ── Validate required env vars ────────────────────────────────────────────
  if (!process.env.MONGO_URI) {
    console.error('❌  MONGO_URI is not set in your .env file.')
    process.exit(1)
  }
  if (!ADMIN_EMAIL) {
    console.error('❌  ADMIN_EMAIL is not set in your .env file.')
    process.exit(1)
  }
  if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
    console.error('❌  ADMIN_PASSWORD must be set and at least 8 characters long.')
    process.exit(1)
  }

  // ── Connect ───────────────────────────────────────────────────────────────
  console.log('🔗  Connecting to MongoDB…')
  await mongoose.connect(process.env.MONGO_URI)
  console.log('✅  Connected.')

  // ── Check for existing admin ──────────────────────────────────────────────
  const existing = await User.findOne({ email: ADMIN_EMAIL })

  if (existing) {
    if (existing.role !== 'admin') {
      // Promote to admin if somehow the account exists as a regular user
      existing.role = 'admin'
      await existing.save()
      console.log(`⬆️   Promoted existing user "${ADMIN_EMAIL}" to admin.`)
    } else {
      console.log(`ℹ️   Admin account "${ADMIN_EMAIL}" already exists. Nothing to do.`)
    }
  } else {
    // Create a fresh admin account — password is hashed by the User pre-save hook
    await User.create({
      email:     ADMIN_EMAIL,
      password:  ADMIN_PASSWORD,
      firstName: 'System',
      lastName:  'Admin',
      role:      'admin',
    })
    console.log(`🎉  Admin account "${ADMIN_EMAIL}" created successfully.`)
  }

  // ── Disconnect ────────────────────────────────────────────────────────────
  await mongoose.disconnect()
  console.log('👋  Disconnected. Done.')
  process.exit(0)
}

main().catch((err) => {
  console.error('❌  Seed script failed:', err)
  process.exit(1)
})
