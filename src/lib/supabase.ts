import { createClient } from "@supabase/supabase-js";

// Inicializa o cliente Supabase com as credenciais fornecidas
export const supabaseUrl = "https://tujoonpbanvkzhqliqdq.supabase.co";
export const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1am9vbnBiYW52a3pocWxpcWRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MjkzNjAsImV4cCI6MjA2MTAwNTM2MH0.4r5gSSH8ppvvO8ad2kW_JUVgdIKFID9Ck2J5ftZC2HQ";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
