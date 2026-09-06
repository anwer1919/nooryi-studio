import { NextResponse } from "next/server"
// sendOtp used for OTP verification

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: "البريد مطلوب" }, { status: 400 })
    
    await sendOtp(email)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}