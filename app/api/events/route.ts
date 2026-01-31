import { NextRequest, NextResponse } from "next/server";
import {v2 as cloudinary} from "cloudinary";

import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Whitelist of allowed event fields
const ALLOWED_FIELDS = [
  'title',
  'slug',
  'description',
  'overview',
  'venue',
  'location',
  'date',
  'time',
  'mode',
  'audience',
  'agenda',
  'organizer',
  'tags',
] as const;

// Validate and sanitize event data
function validateEventData(rawData: Record<string, any>): { valid: boolean; data?: Record<string, any>; error?: string } {
  // Check required fields
  const requiredFields = ['title', 'description', 'overview', 'location', 'date'];
  for (const field of requiredFields) {
    if (!rawData[field] || typeof rawData[field] !== 'string' || rawData[field].trim() === '') {
      return { valid: false, error: `Missing or invalid required field: ${field}` };
    }
  }

  // Validate mode field if present
  if (rawData.mode && !['online', 'offline', 'hybrid'].includes(rawData.mode)) {
    return { valid: false, error: 'Invalid mode. Must be one of: online, offline, hybrid' };
  }

  // Whitelist and sanitize fields
  const sanitized: Record<string, any> = {};
  for (const field of ALLOWED_FIELDS) {
    if (field in rawData && rawData[field] !== undefined && rawData[field] !== '') {
      // Convert to string and trim for text fields
      sanitized[field] = typeof rawData[field] === 'string' ? rawData[field].trim() : rawData[field];
    }
  }

  return { valid: true, data: sanitized };
}

export async function POST(req :NextRequest) {
  try {
    await connectDB();
    const formData = await req.formData();
    let event;
    
    try {
      event = Object.fromEntries(formData.entries());
    } catch (e) {
      return NextResponse.json({ message: 'Invalid form data'}, {status: 400} );
    }

    const file = formData.get('image') as File ;
    if (!file){
      return NextResponse.json({ message: 'Image file is required'}, {status: 400} );
    }

    // Parse JSON arrays with error handling
    let tags: string[] = [];
    let agenda: string[] = [];
    
    try {
      const tagsData = formData.get('tags') as string;
      const agendaData = formData.get('agenda') as string;
      
      if (tagsData) tags = JSON.parse(tagsData);
      if (agendaData) agenda = JSON.parse(agendaData);
    } catch (parseError) {
      return NextResponse.json({ message: 'Invalid JSON format for tags or agenda' }, { status: 400 });
    }

    // Validate and sanitize event data
    const validation = validateEventData(event);
    if (!validation.valid) {
      return NextResponse.json({ message: validation.error }, { status: 400 });
    }
    const sanitizedEvent = validation.data!;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadResult = await new Promise ((resolve, reject) => {
      cloudinary.uploader.upload_stream({
        resource_type: 'image',
        folder: 'DevEvents',}
        , (error, result) => {
        if (error) return reject(error);
        resolve(result);}).end(buffer);
    });

    sanitizedEvent.image = (uploadResult as { secure_url: string }).secure_url;
    sanitizedEvent.tags = tags;
    sanitizedEvent.agenda = agenda;

    const createdEvent = await Event.create(sanitizedEvent);

    return NextResponse.json({ message: 'event created', event: createdEvent }, { status: 201 } );


  } catch (e) {
    console.error("Error handling POST request:", e);

    return NextResponse.json({ message: 'event creation failed', error: e  instanceof Error ? e.message : "Unknown" }, { status: 500 } );
  }
}

export async function GET() {
  try {
    
    await connectDB();
    const events = await Event.find().sort({ createdAt: -1 });
    return NextResponse.json({ events }, { status: 200 } );

  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch events', error: error instanceof Error ? error.message : "Unknown" }, { status: 500 } );
  }
}

