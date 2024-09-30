import { updateEventStatuses } from "./eventUpdater";

async function scheduleUpdates() {
  await updateEventStatuses();
  setTimeout(scheduleUpdates, 6000000); // Обновляем каждую минуту
}

scheduleUpdates();
