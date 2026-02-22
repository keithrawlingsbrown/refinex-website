import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'data', 'refinex.db')
const db = new Database(dbPath)

// Initialize database tables
export function initDatabase() {
  // Enterprise leads table
  db.exec(`
    CREATE TABLE IF NOT EXISTS enterprise_leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT NOT NULL,
      role TEXT NOT NULL,
      email TEXT NOT NULL,
      cloud_providers TEXT NOT NULL,
      monthly_spend TEXT NOT NULL,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Waitlist table
  db.exec(`
    CREATE TABLE IF NOT EXISTS waitlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      source TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Support escalations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS support_escalations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

// Initialize DB on import
initDatabase()

export interface EnterpriseLead {
  companyName: string
  role: string
  email: string
  cloudProviders: string
  monthlySpend: string
  message?: string
}

export function saveEnterpriseLead(lead: EnterpriseLead) {
  const stmt = db.prepare(`
    INSERT INTO enterprise_leads (company_name, role, email, cloud_providers, monthly_spend, message)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  
  return stmt.run(
    lead.companyName,
    lead.role,
    lead.email,
    lead.cloudProviders,
    lead.monthlySpend,
    lead.message || null
  )
}

export function getEnterpriseLeads() {
  const stmt = db.prepare(`
    SELECT * FROM enterprise_leads ORDER BY created_at DESC
  `)
  return stmt.all()
}

export interface WaitlistEntry {
  email: string
  source?: string
}

export function addToWaitlist(entry: WaitlistEntry) {
  const stmt = db.prepare(`
    INSERT INTO waitlist (email, source) VALUES (?, ?)
  `)
  return stmt.run(entry.email, entry.source || null)
}

export interface SupportEscalation {
  name: string
  email: string
  message: string
}

export function saveSupportEscalation(escalation: SupportEscalation) {
  const stmt = db.prepare(`
    INSERT INTO support_escalations (name, email, message)
    VALUES (?, ?, ?)
  `)
  return stmt.run(escalation.name, escalation.email, escalation.message)
}

export default db
