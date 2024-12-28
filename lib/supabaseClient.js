import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fkasbkmcoumsezziolzo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrYXNia21jb3Vtc2V6emlvbHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUxMjkzMDEsImV4cCI6MjA1MDcwNTMwMX0.JUm2jrMSl3ROyRDxWQZL8fEGcebGwJZGoSek5SaBlXQ'

export const supabase = createClient(supabaseUrl, supabaseKey)