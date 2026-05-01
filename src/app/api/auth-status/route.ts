import { NextResponse } from 'next/server';

function getConfiguredApiBaseUrl() {
    return process.env.OPENAI_API_BASE_URL?.trim() || '';
}

function getTokenConsoleUrl(apiBaseUrl: string) {
    if (!apiBaseUrl) return '';

    try {
        return new URL('/console/token', apiBaseUrl).toString();
    } catch {
        return '';
    }
}

export async function GET() {
    const appPasswordSet = !!process.env.APP_PASSWORD;
    const apiBaseUrl = getConfiguredApiBaseUrl();

    return NextResponse.json({
        passwordRequired: appPasswordSet,
        apiBaseUrl,
        tokenConsoleUrl: getTokenConsoleUrl(apiBaseUrl)
    });
}
