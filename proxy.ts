import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import getOrCreateDatabases from './models/server/dbSetup'
import getOrCreateStorage from './models/server/storageSetup'

export async function proxy(request: NextRequest) {
    // Initialize database and storage before anything runs
    await Promise.all([
        getOrCreateDatabases(),
        getOrCreateStorage()
    ])


    return NextResponse.next()
}

export const config = {
    matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}
