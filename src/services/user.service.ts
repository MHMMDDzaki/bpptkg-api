import User from "../models/user.model";
import jwt from "jsonwebtoken";
import { StringValue } from "ms";

export default class UserService {
  static async registerUser(username: string, password: string) {
    try {
      const existingUser = await User.findOne({ username });
      if (existingUser) throw new Error("Username already exists");

      const newUser = new User({ username, password });
      const savedUser = await newUser.save();

      const expiresIn = (process.env.JWT_EXPIRES_IN || "1h") as StringValue;
      
      const token = jwt.sign(
        { userId: savedUser._id.toString(), username: savedUser.username },
        process.env.JWT_SECRET!,
        { expiresIn }
      );

      return {
        token: "Bearer " + token,
        user: {
          id: savedUser._id.toString(),
          username: savedUser.username
        }
      };
    } catch (error) {
      throw error;
    }
  }
}