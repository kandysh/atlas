/**
 * Get user information from environment variable
 * Format: {"id": 1, "details": {"email": "user@example.com", "name": "User Name"}}
 * or: {"id": 1, "email": "user@example.com", "name": "User Name"}
 */
export function getUserInfo(): {
  id: number;
  details: { email: string; name: string };
} | null {
  try {
    const userInfoEnv = process.env.USERINFO;
    if (!userInfoEnv) {
      console.error("USERINFO environment variable not set");
      return null;
    }

    const userInfo = JSON.parse(userInfoEnv);

    // Support both nested and flat structure
    const email = userInfo.details?.email || userInfo.email;
    const name = userInfo.details?.name || userInfo.name;

    if (!email || !name) {
      console.error("USERINFO must contain email and name");
      return null;
    }

    return {
      id: userInfo.id,
      details: {
        email,
        name,
      },
    };
  } catch (error) {
    console.error("Failed to parse USERINFO:", error);
    return null;
  }
}
