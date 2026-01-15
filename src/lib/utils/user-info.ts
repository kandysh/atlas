/**
 * Get user information from environment variable
 * Format: {"email": "user@example.com", "name": "User Name"}
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

    if (!userInfo.details.email || !userInfo.details.name) {
      console.error("USERINFO must contain email and name");
      return null;
    }

    return {
      id: userInfo.id,
      details: {
        email: userInfo.email,
        name: userInfo.name,
      },
    };
  } catch (error) {
    console.error("Failed to parse USERINFO:", error);
    return null;
  }
}
