import connectMongoDB from "@/../config/mongodb";
import Item from "@/models/itemSchema";
import { NextResponse, NextRequest } from "next/server";

export async function GET() {
  try {
    await connectMongoDB();
    const items = await Item.find();
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching items", error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await connectMongoDB();
    const newItem = await Item.create(body);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating item", error },
      { status: 500 }
    );
  }
}
