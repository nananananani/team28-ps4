import { NextResponse } from "next/server";
import { listTickets, createTicketRecord } from "@/lib/db";
import { createTicketSchema } from "@/lib/schemas";

export const runtime = "nodejs";

/**
 * GET /api/tickets
 * Query params: employee_id, status, priority
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employee_id = searchParams.get("employee_id") || undefined;
    const status = searchParams.get("status") || undefined;
    const priority = searchParams.get("priority") || undefined;

    const tickets = await listTickets({
      employee_id,
      status,
      priority,
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load tickets";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/tickets
 * Creates a new IT helpdesk ticket
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = createTicketSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid ticket parameters", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const ticket = await createTicketRecord(parsed.data);
    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create ticket";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
