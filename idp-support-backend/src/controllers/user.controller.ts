import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  sendModeratorCreatedEmail,
  sendRegistrationEmail,
} from "../utils/mailer.js";
import { normalizeUser } from "../utils/normalization.js";
import { Request, Response } from "express";
import { UserStatus } from "../enums/UserStatus.js";
import { UserRole } from "../enums/UserRole.js";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";

export interface IGetUserAuthInfoRequest extends Request {
  user: {
    id: string;
    role: UserRole;
  };
}

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    if (!firstName || !lastName || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Не всі обов’язкові поля заповнені" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Користувач з такою електронною поштою вже існує" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashed,
      role,
      status: "Active",
      isDocumentsVerified: role === "IDP" ? false : undefined,
    });
    await user.save();

    try {
      await sendRegistrationEmail({ to: email, firstName });
    } catch (emailErr) {
      console.error("Не вдалося надіслати email:", emailErr);
    }

    res.status(201).json({ message: "Користувача успішно створено" });
  } catch (err) {
    console.error("Помилка реєстрації:", err);
    res.status(500).json({ message: "Внутрішня помилка сервера" });
  }
};

export const updateProfile = async (req: IGetUserAuthInfoRequest, res: Response) => {
  try {
    const { firstName, lastName } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;

    user.updatedAt = new Date();
    await user.save();

    res.json({ user: normalizeUser(user) });
  } catch (err) {
    console.error("Помилка оновлення профілю:", err);
    res.status(500).json({ message: "Внутрішня помилка сервера" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !user.password) {
    return res
      .status(401)
      .json({ message: "Невірна електронна пошта або пароль" });
  }

  if (user.status === "Deleted") {
    return res.status(404).json({ message: "Користувача не знайдено в системі" });
  }

  if (user.status === "Suspended") {
    return res.status(403).json({ message: "Ваш аккаунт тимчасово призупинено" });
  }


  const isMatch = await bcrypt.compare(password, user?.password);
  if (!isMatch) {
    return res
      .status(401)
      .json({ message: "Невірна електронна пошта або пароль" });
  }

  const userChats = await Chat.find({
    $or: [
      { landlordId: user._id },
      { idpId: user._id },
      { moderatorId: user._id },
    ]
  }).select('_id');

  const chatIds = userChats.map(chat => chat._id);

  const unreadCount = await Message.countDocuments({
    chatId: { $in: chatIds },
    readBy: { $ne: user._id },
    senderId: { $ne: user._id },
  });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET!,
    {
      expiresIn: "15m",
    }
  );

  try {
    const normalizedUser = normalizeUser(user);

    res.json({
      token,
      user: { ...normalizedUser, unreadCount }
    });
  } catch (err) {
    console.error('Error serializing user:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const verifySession = async (req: IGetUserAuthInfoRequest, res: Response) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    const userChats = await Chat.find({
      $or: [
        { landlordId: user._id },
        { idpId: user._id },
        { moderatorId: user._id },
      ]
    }).select('_id');

    const chatIds = userChats.map(chat => chat._id);

    const unreadCount = await Message.countDocuments({
      chatId: { $in: chatIds },
      readBy: { $ne: user._id },
      senderId: { $ne: user._id },
    });

    res.json({ user: { ...normalizeUser(user), unreadCount } });
  } catch (err) {
    console.error("Помилка перевірки сесії:", err);
    res.status(500).json({ message: "Внутрішня помилка сервера" });
  }
};

export const createModerator = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: "Усі поля є обовʼязковими" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email вже використовується" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    const user = new User({
      firstName,
      lastName,
      email,
      role: "Moderator",
      resetPasswordToken: token,
      resetPasswordExpires: Date.now() + 3600000,
      status: "Unverified",
    });

    await user.save();

    sendModeratorCreatedEmail({ to: email, firstName, lastName, token }).catch(
      (err: any) => console.error("Не вдалося надіслати email модератору:", err)
    );

    res.status(201).json({ moderator: normalizeUser(user) });
  } catch (err) {
    console.error("Помилка створення модератора:", err);
    res.status(500).json({ message: "Помилка сервера" });
  }
};

export const activatePassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res
      .status(400)
      .json({ message: "Недійсний або протермінований токен" });
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.status = UserStatus.Active;
  user.updatedAt = new Date();
  await user.save();

  res.status(200).json({ message: "Пароль встановлено успішно" });
};

export const getModerators = async (req: Request, res: Response) => {
  try {
    const moderators = await User.find({
      role: "Moderator",
    }).select("-password");

    res.json({ moderators: moderators.map(normalizeUser) });
  } catch (err) {
    console.error("Помилка отримання модераторів:", err);
    res.status(500).json({ message: "Внутрішня помилка сервера" });
  }
};

export const getModeratorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const moderator = await User.findById(id).select("-password");

    if (!moderator || moderator.role !== "Moderator") {
      return res.status(404).json({ message: "Модератора не знайдено" });
    }

    res.json({ moderator });
  } catch (err) {
    console.error("Помилка при отриманні модератора:", err);
    res.status(500).json({ message: "Внутрішня помилка сервера" });
  }
};

export const updateModeratorBySuperUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName } = req.body;

    if (!firstName || !lastName) {
      return res
        .status(400)
        .json({ message: "Імʼя та прізвище є обовʼязковими" });
    }

    const user = await User.findById(id);
    if (!user || user.role !== "Moderator") {
      return res.status(404).json({ message: "Модератора не знайдено" });
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.updatedAt = new Date();

    await user.save();

    res.json({ moderator: normalizeUser(user) });
  } catch (err) {
    console.error("Помилка оновлення модератора:", err);
    res.status(500).json({ message: "Внутрішня помилка сервера" });
  }
};

export const deleteModeratorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user || user.role !== "Moderator") {
      return res.status(404).json({ message: "Модератора не знайдено" });
    }

    user.status = UserStatus.Deleted;
    user.updatedAt = new Date();
    await user.save();

    res.status(204).end();
  } catch (err) {
    console.error("Помилка видалення модератора:", err);
    res.status(500).json({ message: "Внутрішня помилка сервера" });
  }
};

export const resendActivatePasswordLink = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user || user.role !== "Moderator") {
      return res.status(404).json({ message: "Модератора не знайдено" });
    }

    if (user.status !== "Unverified") {
      return res.status(400).json({ message: "Модератор вже був активований" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    sendModeratorCreatedEmail({
      to: user?.email,
      firstName: user?.firstName,
      lastName: user?.lastName,
      token,
    }).catch((err: any) =>
      console.error("Не вдалося надіслати email модератору:", err)
    );

    res.status(204).end();
  } catch (err) {
    console.error("Помилка повторного надсилання активації:", err);
    res.status(500).json({ message: "Внутрішня помилка сервера" });
  }
};
