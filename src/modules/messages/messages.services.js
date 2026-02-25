import {
  create,
  find,
  findOne,
} from "../../DB/database.repository.js";
import { messageModel } from "../../models/message.model.js";
import { successResponse } from "../../common/utils/response/success.response.js";
import { userModel } from "../../models/user.model.js";
export const sendMessages = async (req, res) => {
  try {
    const senderId = req.userId;
    const { content, recieverId, isAnonymous, isSaved } = req.body;
    console.log(req.body);

    const userExists = await findOne({
      model: userModel,
      filter: { _id: recieverId },
    });
    if (!userExists) {
      throw new Error("reciever not found");
    }
    // console.log(userExists);

    const message = await create({
      model: messageModel,
      data: {
        senderId,
        content,
        recieverId,
        isAnonymous: isAnonymous ?? true,
        isSaved: isSaved ?? false,
      },
    });
    return successResponse({ res, data: { message } });
  } catch (error) {
    console.log("CREATE ERROR:", error);
    return res.status(500).json({ error: "Failed to send message" });
  }
};
export const getMessages = async (req, res) => {
  try {
    const recieverId = req.userId;
    if (!recieverId) {
      throw new Error("Unauthorized");
    }
    const messages = await find({
      model: messageModel,
      filter: {
        recieverId,
      },
    });
    return successResponse({
      res,
      data: { messages },
    });
  } catch (error) {
    console.log("GET MESSAGES ERROR:", error);
    return res.status(500).json({ error: "Failed to get messages" });
  }
};
export const toggleSaved = async (req, res) => {
  const senderId = req.userId;
  const { messageId } = req.body;
  const message = await findOne({
    model: messageModel,
    filter: { senderId: senderId, _id: messageId },
  });
  if (!message) {
    throw new Error("not found or unauthorized");
  }
  message.isSaved = !message.isSaved;
  await message.save();
  return successResponse({ res, data: { message } });
};
export const getSavedMessages = async (req, res) => {
  const senderId = req.userId;
  const savedMessage = await find({
    model: messageModel,
    filter: { sender: senderId, isSaved: true },
  });
  return successResponse({ res, data: { savedMessage } });
};
export const toggleFavorite = async (req, res) => {
  const recipientId = req.userId;
  if (!recipientId) {
    return res.status(401).json({ message: "user not found" }); //momken el recipient yrga3 undefined
  }
  const { messageId } = req.body;

  const message = await messageModel.findOne({
    _id: messageId,
    recieverId: recipientId,
  });
  if (!message) {
    return res.status(400).json({ message: "Not found or unauthorized" });
  }

  message.isFavorite = !message.isFavorite;
  await message.save();
  return successResponse({ res, data: { message } });
};
export const getFavoriteMessages = async (req, res) => {
  try {
    const recieverId = req.userId;
    if (!recieverId) {
      return res
        .status(401)
        .json({ message: "user not found or unauthorized" });
    }
    const messages = await find({
      model: messageModel,
      filter: {
        recieverId,
        isFavorite: true,
      },
    });
    return successResponse({ res, data:{messages} });
  } catch (error) {
    console.log("GET FAVORITE MESSAGES ERROR:", error);
    return res.status(500).json({ error: "Failed to get favorite messages" });
  }
};
