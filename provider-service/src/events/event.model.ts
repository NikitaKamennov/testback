export interface Event {
  id: string;
  coefficient: number;
  deadline: number;
  status: "pending" | "first_team_won" | "second_team_won";
}

export type CreateEvent = Omit<Event, "id" | "status">;

export type UpdateEventStatus = {
  status: Event["status"];
};
