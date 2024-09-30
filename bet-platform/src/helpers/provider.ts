import axios from "axios";

const providerUrl = "http://localhost:3000";

export interface Event {
  id: string;
  coefficient: number;
  deadline: number;
  status: "pending" | "first_team_won" | "second_team_won";
}

export async function getEventsFromProvider(): Promise<Event[]> {
  try {
    const response = await axios.get(`${providerUrl}/events`);
    return response.data;
  } catch (error) {
    console.error("Error fetching events from provider:", error);
    throw error;
  }
}
