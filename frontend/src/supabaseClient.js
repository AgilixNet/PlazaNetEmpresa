import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vcotkzkiwbyybncbjeiv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjb3Rremtpd2J5eWJuY2JqZWl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzcwMjAsImV4cCI6MjA3NzA1MzAyMH0.057uw60e6QR2M9gx-3nm9Rt370tagPvMFBP7QBedmz4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)