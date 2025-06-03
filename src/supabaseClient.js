import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oykpltxvojjpzfhmncok.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95a3BsdHh2b2pqcHpmaG1uY29rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0Njk1MTUsImV4cCI6MjA2NDA0NTUxNX0.0JJy3xCkCNtbkoYEzIq5eOlA1xqu0rbxtM0C5ID6tjY'

export const supabase = createClient(supabaseUrl, supabaseKey)