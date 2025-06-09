
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://esnrlqlcchnjrtfvnvzv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzbnJscWxjY2huanJ0ZnZudnp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMTU2NTksImV4cCI6MjA2Mjg5MTY1OX0.jvJ6JGGfMZlbaFyJPEJ2nfb4RMfOodWYUoStiIry4A8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})
