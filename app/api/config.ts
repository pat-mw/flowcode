// CORS configuration - same origins as oRPC
export const ALLOWED_ORIGINS = [
    'https://blogflow-three.webflow.io',
    'https://blogflow-v1.webflow.io',
    'http://localhost:3000',
    'https://blogflow-three.vercel.app',
    'https://webcn-v1.webflow.io',
    'https://flowcode-v1.webflow.io',
];

export function isOriginAllowed(origin: string | null): boolean {
    if (!origin) return false;
    return ALLOWED_ORIGINS.includes(origin);
}