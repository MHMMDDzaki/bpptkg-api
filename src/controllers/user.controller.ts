import { RequestHandler } from "express";
import UserService from "../services/user.service";
import {
  RegisterRequestBody,
  ErrorResponse,
  AuthTokenResponse,
} from "../interfaces/auth.interface";

export default class UserController {
  static register: RequestHandler<{}, AuthTokenResponse | ErrorResponse, RegisterRequestBody> = 
    async (req, res) => {
      try {
        const result = await UserService.registerUser(req.body.username, req.body.password);
        res.status(201).json({ success: true, ...result });
      } catch (error: any) {
        const status = error.message === "Username already exists" ? 409 : 500;
        res.status(status).json({
          success: false,
          message: error.message
        });
      }
    };
}