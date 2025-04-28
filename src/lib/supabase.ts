import { createClient } from "@supabase/supabase-js";
import { loadDbConfig } from "./config";

// Get configuration from localStorage or use environment variables as fallback
const getSupabaseConfig = () => {
  try {
    // Try to get config from localStorage first
    const dbConfig = loadDbConfig();

    // Use values from config if available
    if (dbConfig.supabaseUrl && dbConfig.supabaseAnonKey) {
      return {
        supabaseUrl: dbConfig.supabaseUrl,
        supabaseAnonKey: dbConfig.supabaseAnonKey,
      };
    }
  } catch (error) {
    console.error("Error loading Supabase config from localStorage:", error);
  }

  // Fallback to environment variables
  return {
    supabaseUrl: "https://tujoonpbanvkzhqliqdq.supabase.co",
    supabaseAnonKey:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1am9vbnBiYW52a3pocWxpcWRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MjkzNjAsImV4cCI6MjA2MTAwNTM2MH0.4r5gSSH8ppvvO8ad2kW_JUVgdIKFID9Ck2J5ftZC2HQ",
  };
};

// Get the configuration
const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

// Initialize the Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
export { supabaseUrl, supabaseAnonKey };
