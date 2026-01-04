import { Request, Response } from "express";
import { registerDto, loginDto } from "../dtos/user.dto";
import {
  registerUserService,
  loginUserService,
} from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const data = registerDto.parse(req.body);
    const user = await registerUserService(data);

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const data = loginDto.parse(req.body);
    const result = await loginUserService(data.email, data.password);

    res.status(200).json({
      message: "Login successful",
      token: result.token,
      user: result.user,
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};
