import { Event, CreateEvent, UpdateEventStatus } from "./event.model";
import axios from "axios";
class EventService {
  private events: Map<string, Event> = new Map();

  getAllEvents(): Event[] {
    return Array.from(this.events.values());
  }

  createEvent(eventData: CreateEvent): Event {
    if (
      eventData.coefficient <= 0 ||
      typeof eventData.coefficient !== "number" ||
      eventData.coefficient.toString().split(".")[1]?.length > 2
    ) {
      throw new Error(
        "Коэффициент ставки на победу  должен быть положительным числом с двумя знаками после запятой"
      );
    }

    const id = Date.now().toString();
    const event: Event = {
      ...eventData,
      id,
      status: "pending",
    };
    this.events.set(id, event);
    return event;
  }
  //////////////////////////////////////////////////// оповещаем бэт платформу ///////////////////////////////////////
  async notifyBetPlatform(
    eventId: string,
    coefficient: Event["coefficient"],
    deadline: Event["deadline"],
    status: UpdateEventStatus["status"]
  ) {
    try {
      await axios.post(`http://localhost:3001/events/status-update`, {
        eventId,
        coefficient,
        deadline,
        status,
      });
      console.log(
        `Successfully notified bet-platform about event ${eventId} status update`
      );
    } catch (error: any) {
      console.error(`Failed to notify bet-platform: ${error.message}`);
    }
  }
  ////////////////////////////////////////////////обновляем статус события и извещаем бэт платформу ///////////////////////////////////////
  async updateEventStatus(
    id: string,
    status: UpdateEventStatus["status"]
  ): Promise<Event | null> {
    const event = this.events.get(id);
    if (!event) return null;

    event.status = status;
    this.events.set(id, event);

    // Отправляем уведомление в bet-platform
    await this.notifyBetPlatform(id, event.coefficient, event.deadline, status);

    return event;
  }

  ////////////////////////////////////////всё на бэт платформу /////////////////////////////////////////
  getAllEventsFromProvider(): Event[] {
    return Array.from(this.events.values()).map((event) => ({
      id: event.id,
      coefficient: event.coefficient,
      deadline: event.deadline,
      status: event.status,
    }));
  }
}

export default new EventService();
