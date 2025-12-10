import { NextRequest, NextResponse } from "next/server";
import { Client, Databases, ID, Permission, Role } from "node-appwrite";

export const runtime = "nodejs";

// -----------------------------
// Appwrite server config
// -----------------------------
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;

// We won't crash the build if these are missing, but the route will error at runtime.
if (!endpoint || !projectId || !apiKey) {
  console.warn(
    "[sealabid] Appwrite server config missing. " +
      "Set NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID and APPWRITE_API_KEY."
  );
}

const client = new Client();
if (endpoint && projectId && apiKey) {
  client.setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
}

const databases = new Databases(client);

// Match what you're already using elsewhere
const DB_ID = "sealabid_main_db";
const LISTINGS_COLLECTION_ID = "listings";
const BIDS_COLLECTION_ID = "bids";

// -----------------------------
// POST /api/place-bid
// -----------------------------
export async function POST(req: NextRequest) {
  try {
    if (!endpoint || !projectId || !apiKey) {
      return NextResponse.json(
        {
          error:
            "Server Appwrite config missing. Contact support or try again later.",
        },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({} as any));
    const { listingId, amount, bidderId, bidderName } = body || {};

    if (!listingId || typeof listingId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid listingId." },
        { status: 400 }
      );
    }

    const parsedAmount =
      typeof amount === "number" ? amount : Number(String(amount).trim());

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid bid amount." },
        { status: 400 }
      );
    }

    if (!bidderId || typeof bidderId !== "string") {
      return NextResponse.json(
        { error: "Missing bidderId." },
        { status: 400 }
      );
    }

    // 1) Load the listing
    const listing: any = await databases.getDocument(
      DB_ID,
      LISTINGS_COLLECTION_ID,
      listingId
    );

    const now = Date.now();
    const endsAtTime = listing.endsAt ? new Date(listing.endsAt).getTime() : NaN;

    if (!listing.status || listing.status !== "active") {
      return NextResponse.json(
        { error: "This listing is not accepting bids." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(endsAtTime) || endsAtTime <= now) {
      return NextResponse.json(
        { error: "This listing has already ended." },
        { status: 400 }
      );
    }

    const sellerId: string | undefined = listing.sellerId;

    // 2) Permissions: bidder can see/manage their own bid; seller can read bids.
    const permissions = [
      Permission.read(Role.user(bidderId)),
      Permission.update(Role.user(bidderId)),
      Permission.delete(Role.user(bidderId)),
    ];

    if (sellerId) {
      permissions.push(Permission.read(Role.user(sellerId)));
    }

    // 3) Create bid document (sealed)
    const roundedAmount = Math.round(parsedAmount);

    const bidDoc = await databases.createDocument(
      DB_ID,
      BIDS_COLLECTION_ID,
      ID.unique(),
      {
        listingId,
        bidderId,
        bidderName,
        amount: roundedAmount,
      },
      permissions
    );

    // 4) Increment bidsCount on listing
    const currentCount =
      typeof listing.bidsCount === "number" ? listing.bidsCount : 0;

    const updated = await databases.updateDocument(
      DB_ID,
      LISTINGS_COLLECTION_ID,
      listingId,
      {
        bidsCount: currentCount + 1,
      }
    );

    return NextResponse.json(
      {
        ok: true,
        bidId: bidDoc.$id,
        bidsCount: updated.bidsCount ?? currentCount + 1,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Error in /api/place-bid:", err);
    const message =
      err?.message ||
      err?.response?.message ||
      "Failed to place sealed bid. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
