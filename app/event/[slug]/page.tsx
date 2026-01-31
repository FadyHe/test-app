import { notFound } from "next/navigation"
import Image from "next/image"
import { json } from "stream/consumers"
import BookEvent from "@/components/BookEvent"
import { getSimilarEventsBySlug } from "@/lib/actions/event.actions"
import EventsCard from "@/components/EventsCard"

const EventDetailItem = ({icon, alt, label} : {icon: string ,label : string, alt : string}) => (
  <div className="flex-row-gap-2 items-center">
    <Image src={icon} alt={alt} width={17} height={17}  />
    <p>{label}</p>
  </div>
)

const EventAgenda = ({ agendaItems } : {agendaItems : string[]}) => (
  <div className="agenda ">
    <h2>
      Event Agenda
    </h2>
    <ul>
      {agendaItems.map((item, index) => (
        <li key={index} className="">
            {item}
          </li>
      ))}
    </ul>
  </div>
)
const EventTags = ({ tags } : {tags : string[]}) => (
  <div className="flex flex-row gap-2 items-center flex-wrap">
    {tags.map((item) => (
      <div key={item} className="pill">
        {item}
      </div>
    ))}
  </div>
)

const EventDetailsPage = async ({params} : {params : Promise<{slug : string}>}) => {
  const {slug} = await params
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events/${slug}`)
  
  if (!response.ok) {
    return notFound()
  }
  
  const data = await response.json()
  const event = data?.event
  
  if (!event?.description) {
    return notFound()
  }

  const bookings = 10;
  const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug) 
  
  
  const { description, image, overview, date, time, location, mode, agenda, audience, organizer, tags, venue } = event    

  return (
    <section id="event">
      <div className="header">
        <h1>Event Description</h1>
        <p className="mt-2">{description}</p>
      </div>
      <div className="details">
        {/* left side - details */}
        <div className="content">
          <Image src={image} alt="EventBanner" height={800} width={800} className="banner" />
          
          <section className="flex-col-gap-2 ">
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>
          
          <section className="flex-col-gap-2 ">
            <h2>Event Details</h2>
            <EventDetailItem icon="/icons/calendar.svg" alt='calendar' label={date} />
            <EventDetailItem icon="/icons/clock.svg" alt='clock' label={time} />
            <EventDetailItem icon="/icons/pin.svg" alt='pin' label={location} />
            <EventDetailItem icon="/icons/mode.svg" alt='mode' label={mode} />
            <EventDetailItem icon="/icons/audience.svg" alt='audience' label={audience} />          </section>

          <EventAgenda agendaItems={agenda} />

          <section className="flex-col-gap-2">
            <h2>About the Organizer</h2>
            <p>{organizer}</p>
          </section>
          
          <EventTags tags={tags}/>
          
        </div>

        {/* right side - booking */}
        <aside className="booking">
          <div className='signup-card'>
            <h2>Book Your Spot</h2>
            {bookings > 0 ? (<p className='text-sm'>
              Join {bookings} people who have already booked their spot for this event.
            </p>) : (<p className='text-sm'>
              Be the first to book your spot for this event!
            </p>)}
            <BookEvent />
          </div>
        </aside>
      </div>
      <div className='flex w-full flex-col gap-4 pt-20'>
        <h2>Similar Events</h2>
        <div className='events'>
          {similarEvents.length > 0 && similarEvents.map((similarEvent: IEvent) =>(
            <EventsCard {...similarEvent} key={similarEvent.title}/>
          ))}
        </div>
      </div>
    </section>
  )
}

export default EventDetailsPage
