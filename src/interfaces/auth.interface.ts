import { IUserResponse } from "./user.interface";

export interface LoginRequestBody {
 username: string;
 password: string;
}

export interface RegisterRequestBody {
 username: string;
 password: string;
}

export interface AuthTokenResponse {
 success: boolean;
 token: string;
 user: IUserResponse;
 message?: string;
}

export interface ErrorResponse {
 success: boolean;
 message: string;
 token?: string;
 user?: IUserResponse;
}

export { IUserResponse };
