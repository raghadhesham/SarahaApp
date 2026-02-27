import { successResponse } from "../../common/utils/index.js";
import {
  createOne,
  findByIdAndUpdate,
  findOne,
} from "../../DB/database.repository.js";
import { userModel } from "../../models/user.model.js";
import bcrypt from "bcrypt";
import { hash } from "bcrypt";
import {
  createTokenPayload,
  generateAccessToken,
} from "../../common/utils/auth/token.js";
import { OAuth2Client } from "google-auth-library";
import { ProviderEnum } from "../../config/enums/user.enum.js";
import path from "path";

export const signUp = async (req, res) => {
  const { fullName, email, password, cpassword, gender, age, phone, bio, DOB} =
    req.body;
  const hashed = await hash(password, 12);
  const hashed2 = await hash(cpassword, 12);

  let imageData = req.file


  // let url = `${req.protocol}://${req.host}/${path.resolve(imageData.path)}`
  // console.log(url);
  
  const emailExists = await findOne({
    model: userModel,
    filter: { email },
  });
  if (emailExists) {
    console.log(emailExists);
    throw new Error("conflict");
  }
  const user = await userModel.create({
    fullName,
    email,
    password: hashed,
    cpassword: hashed2,
    gender,
    age,
    phone,
    profilePic : imageData ? imageData.path : undefined,
    bio,
    DOB,
  });

  return successResponse({ res, status: 201, data: { user } });
};
export const signUpWithGmail = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    const client = new OAuth2Client();
    const audience = process.env.AUDIENCE;

    const ticket = await client.verifyIdToken({
      idToken,
      audience: [
        audience // el array 3shan law 3ndy kaza client id 3shan el app beta3y mwst5dm kaza google project
      ], 
    });

    const payload = ticket.getPayload();
    console.log(payload);

    const checkUserExist = await findOne({
      model: userModel,
      filter: {
        email: payload.email,
      },
    });
    console.log(checkUserExist);
    if (checkUserExist) {
      if (checkUserExist.provider == ProviderEnum.system) {
        return res
          .status(409)
          .json({ message: "Account already exists with different provider" });
      } else {
        res
          .status(200)
          .json({ message: "Login successful", user: checkUserExist });
        return await generateAccessToken(payload, "1h");
      }
    }
    const user = await createOne({
      model: userModel,
      data: {
        firstName: payload.given_name,
        lastName: payload.family_name,
        email: payload.email,
        profilePic: payload.picture,
        provider: ProviderEnum.google,
        confirmEmail: new Date(),
      },
    });
    res.status(201).json({ message: "User created successfully", user });
    return await generateAccessToken(payload);
  } catch (err) {
    next(err);
  }
};
export const validateUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await findOne({
    model: userModel,
    filter: { email },
    select: "+password",
    options: { lean: true },
  });
  if (!user) {
    throw new Error("invalid login credentials");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("invalid login credentials");
  }
  return user;
};

export const login = async (req, res) => {
  // console.log("LOGIN res.status:", typeof res?.status);

  const user = await validateUser(req);
  console.log(req.body);
  console.log(user);

  const payload = createTokenPayload(user);
  console.log(payload);

  const access_token = generateAccessToken(payload);

  return successResponse({
    res,
    message: "welcome to our app",
    data: {
      access_token,
    },
  });
};
export const getProfile = async (req, res) => {
  const { id } = req.params;
  const user = await findByIdAndUpdate({
    model: userModel,
    id, //automatic _id:id because of mongoose
    update: {
      $inc: { views: 1 },
    },
    options: {
      new: true,
    },
  });
  if (!user) {
    return res.status(400).json({ message: "user not found" });
  }
  const { fullName, email, followers, following, profilePic, views,bio } = user;
  const followersCount = followers.length;
  const followingCount = following.length;
  return successResponse({
    res,
    data: { fullName, email, followersCount, followingCount, profilePic, views,bio },
  });
};
export const editProfile = async (req, res, next) => {
  try {
    const { fullName, bio, profilePic, gender, DOB } = req.body;

    const result = await userModel.updateOne(
      { _id: req.userId },
      { $set: { fullName, bio, profilePic, gender,DOB } },
      { runValidators: true },
    );
    if (result.matchedCount === 0) {
      throw new Error("User not found");
    }
    return successResponse({ res, message: "Profile updated successfully" });
  } catch (error) {
    return next(error);
  }
};
export const followUser = async (req, res) => {
  const followerId = req.userId;
  const followingId = req.params.id;

  const userToFollow = await userModel.findById(followingId);
  if (!userToFollow) {
    throw new Error("User not found");
  }

  await userModel.findByIdAndUpdate(followingId, {
    $addToSet: { followers: followerId },
  });

  await userModel.findByIdAndUpdate(followerId, {
    $addToSet: { following: followingId },
  });

  res.json({ message: "Followed successfully" });
};

export const unfollowUser = async (req, res) => {
  try {
    const followerId = req.userId; // logged-in user
    const followingId = req.params.id; // user to unfollow

    // Check if target user exists
    const userToUnfollow = await userModel.findById(followingId);
    if (!userToUnfollow) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove follower from target user
    await userModel.findByIdAndUpdate(followingId, {
      $pull: { followers: followerId },
    });

    // Remove following from logged-in user
    await userModel.findByIdAndUpdate(followerId, {
      $pull: { following: followingId },
    });

    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
