export const dynamic = 'force-dynamic'
export const revalidate = 0

import { GET as taskGET, POST as taskPOST } from '../task/route'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// /api/generate 를 /api/task 로 위임하는 래퍼
export async function GET(req: NextRequest) {
  try {
    return await taskGET(req)
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('/api/generate GET error:', error?.message || String(error))
    return NextResponse.json(
      { error: error?.message || String(error) },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    return await taskPOST(req)
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('/api/generate POST error:', error?.message || String(error))
    return NextResponse.json(
      { error: error?.message || String(error) },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}

