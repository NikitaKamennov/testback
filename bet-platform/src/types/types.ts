export interface ErrorMessage {
  message: string;
}

export interface EventStatusUpdateRequest {
  eventId: string;
  coefficient: number;
  deadline: number;
  status: "pending" | "first_team_won" | "second_team_won";
}
