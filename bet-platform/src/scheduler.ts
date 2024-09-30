import { updateEventStatuses } from "./eventUpdater";

async function scheduleUpdates() {
  await updateEventStatuses();
  setTimeout(scheduleUpdates, 60000); // Обновляем каждую минуту
}

scheduleUpdates();
