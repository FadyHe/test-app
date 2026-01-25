import mongoose, { Schema, Document, Types } from 'mongoose'
import { Event } from './event.model'

// Interface for type safety
export interface IBooking extends Document {
  eventId: Types.ObjectId
  email: string
  createdAt: Date
  updatedAt: Date
}

const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      validate: [
        (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        'Invalid email format',
      ],
    },
  },
  {
    timestamps: true,
  }
)

// Create index on eventId for faster queries
bookingSchema.index({ eventId: 1 })

// Pre-save hook: Verify that the referenced event exists
bookingSchema.pre('save', async function (next) {
  try {
    // Check if the event exists in the database
    const eventExists = await Event.findById(this.eventId)
    if (!eventExists) {
      return next(new Error(`Event with ID ${this.eventId} does not exist`))
    }
    next()
  } catch (error) {
    next(error instanceof Error ? error : new Error('Validation error'))
  }
})

// Create or retrieve Booking model
export const Booking =
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema)
