import { connectDB } from "../../db";
import { User } from "../../db/models/User";
import bcrypt from "bcrypt";

export class UserService {
  private collection = "users";

  async register(user: string, password: string, avatar: string) {
    const db = await connectDB();
    const users = db.collection<User>(this.collection);
    
    const existing = await users.findOne({ user });
    if (existing) throw new Error("User already exists");

    const hashed = await bcrypt.hash(password, 10);

    const newUser: User = { user, password: hashed, avatar };
    await users.insertOne(newUser);
  }

  async validate(user: string, password: string) {
    const db = await connectDB();
    const users = db.collection<User>(this.collection);
    const existing = await users.findOne({ user });
    if (!existing) return null;

    const match = await bcrypt.compare(password, existing.password);
    if (!match) return null;

    return existing;
  }
}
