/**
 * Get user information from environment variable
 * Format: {"email": "user@example.com", "name": "User Name"}
 */
export function getUserInfo(): { email: string; name: string } | null {
  try {
    const userInfoEnv = process.env.USERINFO;
    if (!userInfoEnv) {
      console.error("USERINFO environment variable not set");
      return null;
    }

    const userInfo = JSON.parse(userInfoEnv);
    
    if (!userInfo.email || !userInfo.name) {
      console.error("USERINFO must contain email and name");
      return null;
    }

    return {
      email: userInfo.email,
      name: userInfo.name,
    };
  } catch (error) {
    console.error("Failed to parse USERINFO:", error);
    return null;
  }
}
