import { NextResponse } from "next/server";

export async function GET() {
  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return NextResponse.json({
    envStatus: {
      url: supabaseUrl ? `Set: ${supabaseUrl.substring(0, 20)}...` : "NOT SET",
      key: supabaseKey ? `Set: ${supabaseKey.substring(0, 20)}...` : "NOT SET",
    },
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('NEXT')),
  });
}
