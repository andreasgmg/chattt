import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jzkbpylctswzafxioxjj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6a2JweWxjdHN3emFmeGlveGpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMDUzMjIsImV4cCI6MjA1OTg4MTMyMn0.vMCgicAu8A2Vr8qnKcd4RbaDE7WNnSdl54JcaNrlLOI' 

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
