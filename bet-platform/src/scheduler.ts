import { updateEventStatuses } from "./updater";

async function scheduleUpdates() {
  await updateEventStatuses();
  setTimeout(scheduleUpdates, 600000); // Обновляем каждую минуту
}

scheduleUpdates();
