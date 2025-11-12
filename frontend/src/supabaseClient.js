import { createClient } from '@supabase/supabase-js'

// Preferir variables de entorno (Vite) y usar valores actuales como respaldo
const supabaseUrl = import.meta?.env?.VITE_SUPABASE_URL || 'https://vcotkzkiwbyybncbjeiv.supabase.co'
const supabaseAnonKey = import.meta?.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjb3Rremtpd2J5eWJuY2JqZWl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzcwMjAsImV4cCI6MjA3NzA1MzAyMH0.057uw60e6QR2M9gx-3nm9Rt370tagPvMFBP7QBedmz4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)