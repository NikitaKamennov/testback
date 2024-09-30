import fastify from "fastify";
import EventService from "./events/event.service";
import { CreateEvent, UpdateEventStatus } from "./events/event.model";

const server = fastify({ logger: true });
const eventService = EventService;

server.get("/events", async (_, reply) => {
  return eventService.getAllEvents();
});

server.post("/events", async (request, reply) => {
  const eventData = request.body as CreateEvent;
  const newEvent = eventService.createEvent(eventData);
  await eventService.notifyBetPlatform(
    newEvent.id,
    newEvent.coefficient,
    newEvent.deadline,
    "pending"
  );
  reply.send(newEvent);
});

server.put("/events/:id", async (request, reply) => {
  const { id } = request.params as { id: string };
  const statusData = request.body as UpdateEventStatus;

  const updatedEvent = eventService.updateEventStatus(id, statusData.status);
  if (!updatedEvent) {
    reply.code(404).send({ error: "Event not found" });
  }
  return updatedEvent;
});

//////////////////////////////всё на бэтплатформу по запросу////////////////////////////

server.get("/events/updateAll", async (_, reply) => {
  const allEvents = eventService.getAllEventsFromProvider();
  reply.send(allEvents);
});
export default server;

server.post("/events/status-update", async (request, reply) => {
  const { eventId, status } = request.body as {
    eventId: string;
    status: UpdateEventStatus["status"];
  };

  const event = eventService.updateEventStatus(eventId, status);
  if (!event) {
    reply.code(404).send({ error: "Event not found" });
  } else {
    reply.send({ message: `Event ${eventId} status updated to ${status}` });
  }
});
