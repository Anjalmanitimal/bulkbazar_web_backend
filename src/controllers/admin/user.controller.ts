import { Request, Response } from "express";
import z from "zod";
import { AdminUserService } from "../../services/admin/user.service";
import { CreateUserDTO, UpdateUserDTO } from "../../dtos/user.dto";
import { UserRole } from "../../types/user.types";

const adminUserService = new AdminUserService();

export class AdminUserController {
  async createUser(req: Request, res: Response) {
    try {
      const parsed = CreateUserDTO.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsed.error),
        });
      }

      const createData: any = {
        ...parsed.data,
      };

      // ✅ MAP STRING → ENUM
      createData.role = parsed.data.role as UserRole;

      if (req.file) {
        createData.imageUrl = `/uploads/profile/${req.file.filename}`;
      }

      const user = await adminUserService.createUser(createData);

      return res.status(201).json({
        success: true,
        message: "User created",
        data: user,
      });
    } catch (err: any) {
      return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
      });
    }
  }

  async getAllUsers(req: Request, res: Response) {
    const users = await adminUserService.getAllUsers();
    return res.status(200).json({ success: true, data: users });
  }

  async getUserById(req: Request, res: Response) {
    const user = await adminUserService.getUserById(req.params.id);
    return res.status(200).json({ success: true, data: user });
  }

  async updateUser(req: Request, res: Response) {
    const parsed = UpdateUserDTO.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: z.prettifyError(parsed.error),
      });
    }

    const updateData: any = {
      ...parsed.data,
    };

    // ✅ MAP STRING → ENUM
    if (parsed.data.role) {
      updateData.role = parsed.data.role as UserRole;
    }

    if (req.file) {
      updateData.imageUrl = `/uploads/profile/${req.file.filename}`;
    }

    const user = await adminUserService.updateUser(req.params.id, updateData);

    return res.status(200).json({
      success: true,
      message: "User updated",
      data: user,
    });
  }

  async deleteUser(req: Request, res: Response) {
    await adminUserService.deleteUser(req.params.id);
    return res.status(200).json({
      success: true,
      message: "User deleted",
    });
  }
}


