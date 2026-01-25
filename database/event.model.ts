import mongoose, { Schema, Document } from 'mongoose'

// Interface for type safety
export interface IEvent extends Document {
  title: string
  slug: string
  description: string
  overview: string
  image: string
  venue: string
  location: string
  date: string
  time: string
  mode: string
  audience: string
  agenda: string[]
  organizer: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
    },
    overview: {
      type: String,
      required: [true, 'Event overview is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Event image is required'],
    },
    venue: {
      type: String,
      required: [true, 'Event venue is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Event location is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Event date is required'],
    },
    time: {
      type: String,
      required: [true, 'Event time is required'],
    },
    mode: {
      type: String,
      enum: ['online', 'offline', 'hybrid'],
      required: [true, 'Event mode is required'],
    },
    audience: {
      type: String,
      required: [true, 'Target audience is required'],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, 'Event agenda is required'],
      validate: [
        (agenda: string[]) => agenda.length > 0,
        'Agenda must have at least one item',
      ],
    },
    organizer: {
      type: String,
      required: [true, 'Organizer name is required'],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, 'At least one tag is required'],
      validate: [
        (tags: string[]) => tags.length > 0,
        'Tags array must not be empty',
      ],
    },
  },
  {
    timestamps: true,
  }
)

// Pre-save hook: Generate slug from title only if title changes, normalize date to ISO format
eventSchema.pre('save', function (next) {
  // Generate slug only if title is new or has been modified
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .replace(/-+/g, '-')
  }

  // Normalize date to ISO format (YYYY-MM-DD)
  if (this.isModified('date')) {
    // Skip if already in ISO format
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (isoDateRegex.test(this.date)) {
      // Validate it's a real date
      const dateObj = new Date(this.date + 'T00:00:00Z')
      if (isNaN(dateObj.getTime())) {
        return next(new Error('Invalid date format'))
      }
    } else {
      const dateObj = new Date(this.date)
      if (isNaN(dateObj.getTime())) {
        return next(new Error('Invalid date format'))
      }
      this.date = dateObj.toISOString().split('T')[0]
    }
  }

  // Normalize time format (HH:MM or HH:MM:SS)
  if (this.isModified('time') || !this.time) {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/
    if (!timeRegex.test(this.time)) {
      return next(new Error('Invalid time format. Use HH:MM or HH:MM:SS'))
    }
  }

  next()
})

// Create or retrieve Event model
export const Event =
  mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema)
