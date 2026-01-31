import EventsCard from "@/components/EventsCard"
import ExploreBtn from "@/components/exploreBtn" 
import { IEvent } from "@/database";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const page = async () => {
  "use cache"
  const response = await fetch(`${BASE_URL}/api/events`);
  const { events }  = await response.json();  
  
  return (
    <section>
      <h1 className="text-center">The Hub For Every Dev <br /> Event You Can't Miss</h1>
      <p className=" text-center mt-5">Hackthons, Meetups and Confrences, All 
      In One Place</p>
    <ExploreBtn />
    
    <div className="mt-20 space-y-7">
      <h3>Featured Events</h3>

    <ul className="events">
      {events && events.length > 0 && events.map((event : IEvent) => (
        <li key={event.title} className="list-none">
        <EventsCard {...event}/>
        </li>
      ))}
    </ul>

    </div>
    </section>
    
  )
}

export default page