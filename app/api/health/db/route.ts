import dbConnect from "@/lib/db-connect";

export const runtime = "nodejs";          // ensure Node runtime for Mongoose
export const dynamic = "force-dynamic";   // avoid any caching

export async function GET() {
    try {
        await dbConnect();
        return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "content-type": "application/json" },
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return new Response(JSON.stringify({ ok: false, error: error?.message }), {
            status: 500,
            headers: { "content-type": "application/json" },
        });
    }
}
