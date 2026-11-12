import { NextResponse } from "next/server";
import { updateTicketRecord, getTicketById } from "@/lib/db";
import { updateTicketSchema } from "@/lib/schemas";

export const runtime = "nodejs";

/**
 * GET /api/tickets/[id]
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 });
    }

    const ticket = await getTicketById(numericId);
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error fetching ticket";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PATCH /api/tickets/[id]
 * Updates status or description
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const parsed = updateTicketSchema.safeParse({ id: numericId, ...body });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid update request", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const updated = await updateTicketRecord(numericId, {
      status: parsed.data.status,
      description: parsed.data.description,
    });

    return NextResponse.json({ ticket: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update ticket";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
