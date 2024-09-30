import { Event, CreateEvent, UpdateEventStatus } from "./event.model";
import axios from "axios";
class EventService {
  private events: Map<string, Event> = new Map();
  // private readonly BET_PLATFORM_URL = "http://bet-platform:3001"; // Предполагаем, что bet-platform работает на порту 3001

  getAllEvents(): Event[] {
    return Array.from(this.events.values());
  }

  createEvent(eventData: CreateEvent): Event {
    const id = Date.now().toString();
    const event: Event = {
      ...eventData,
      id,
      status: "pending",
    };
    this.events.set(id, event);
    return event;
  }

  async notifyBetPlatform(
    eventId: string,
    status: UpdateEventStatus["status"]
  ) {
    try {
      await axios.post(`http://localhost:3001/events/status-update`, {
        eventId,
        status,
      });
      console.log(
        `Successfully notified bet-platform about event ${eventId} status update`
      );
    } catch (error: any) {
      console.error(`Failed to notify bet-platform: ${error.message}`);
    }
  }

  async updateEventStatus(
    id: string,
    status: UpdateEventStatus["status"]
  ): Promise<Event | null> {
    const event = this.events.get(id);
    if (!event) return null;

    event.status = status;
    this.events.set(id, event);

    // Отправляем уведомление в bet-platform
    await this.notifyBetPlatform(id, status);

    return event;
  }
}

export default new EventService();
