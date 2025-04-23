import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request) {
  // SECURITY: Remove this in production!
  try {
    const { email, password } = await request.json();
    
    // Create a typical bcrypt hash with cost factor 10
    const hash = await bcrypt.hash(password, 10);
    
    // Test if we can verify this hash with the same password
    const verifyResult = await bcrypt.compare(password, hash);
    
    return NextResponse.json({
      originalPassword: password,
      passwordLength: password.length,
      hash: hash,
      verificationWorks: verifyResult,
      charCodes: Array.from(password).map(c => c.charCodeAt(0))
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}