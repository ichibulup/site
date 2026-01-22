import axios from "axios";
import { Logging } from "@/lib/logging";

export async function callback() {
  try {
    await axios.post('/api/auth/callback', {}, {
      withCredentials: true,
    });
    console.log(Logging('User synced to backend', 'success', 'green'));
  } catch (error) {
    console.error(Logging(`Failed to sync user: ${error}`, 'error', 'red'));
  }
}
