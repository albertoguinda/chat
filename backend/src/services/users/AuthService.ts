import jwt from "jsonwebtoken";
import { UserService } from "./UserService";

const SECRET = "supermoontechsecret"; // <-- esto lo pasaremos a .env luego

export class AuthService {
  private userService = new UserService();

  async login(user: string, password: string) {
    const validUser = await this.userService.validate(user, password);
    if (!validUser) throw new Error("Invalid credentials");

    const token = jwt.sign({ user: validUser.user }, SECRET, { expiresIn: "1h" });
    return { token, avatar: validUser.avatar };
  }

  async verify(token: string) {
    try {
      const decoded = jwt.verify(token, SECRET) as { user: string };
      return decoded;
    } catch {
      return null;
    }
  }
}
