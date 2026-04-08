import { successResponse } from "../../common/utils/index.js";
import {
  create,
  createOne,
  deleteMany,
  findById,
  findByIdAndUpdate,
  findOne,
  findOneAndUpdate,
  updateOne,
} from "../../DB/database.repository.js";
import { userModel } from "../../models/user.model.js";
import bcrypt, { hash } from "bcrypt";
import { compare } from "bcrypt";
import {
  baseRevokeToken,
  createTokenPayload,
  generateAccessToken,
  generateRefreshToken,
  revokeToken,
} from "../../common/utils/auth/token.js";
import { OAuth2Client } from "google-auth-library";
import { ProviderEnum, roleEnum } from "../../config/enums/user.enum.js";
import {
  deleteRedisValue,
  getRedisValue,
  incrementRedisValue,
  otp_key,
  rediskeys,
  redisValuettl,
  setRedisValue,
  updateRedisValue,
} from "../../DB/redis/redis.services.js";
import { config } from "../../config/configServices.js";
import { generateOTP, sendEmail } from "../../common/utils/email/send.email.js";
import { eventEmitter } from "../../common/utils/email/email.event.js";
import { emailTemplate } from "../../common/utils/email/email.template.js";
import { emailEnum } from "../../config/enums/email.enum.js";
import { errorHandler } from "../../common/utils/response/error.response.js";

export const signUp = async (req, res) => {
  let {
    fullName,
    email,
    password,
    cpassword,
    gender,
    age,
    phone,
    bio,
    DOB,
    role,
  } = req.body;
  const hashed = await hash(password, 12);
  let paths = [];
  if (req.files.album) {
    for (let i = 0; i < req.files.album.length; i++) {
      paths.push(`${req.protocol}://${req.host}/${req.files.album[i].path}`);
    }
  }
  const emailExists = await findOne({
    model: userModel,
    filter: { email },
  });
  if (emailExists) {
    throw new Error("conflict");
  }
  if (role == "admin") {
    role = roleEnum.admin;
  } else {
    role = roleEnum.user;
  }
  const user = await userModel.create({
    fullName,
    email,
    password: hashed,
    gender,
    age,
    phone,
    profilePic: req.files.profilePic[0].path,
    album: paths,
    bio,
    DOB,
    role,
  });
  eventEmitter.emit(emailEnum.confirmEmail, async () => {
    sendOTP(email, "Signup");
  });
  return successResponse({ res, status: 201, data: { user } });
};
export const confirmEmail = async (req, res) => {
  const { gotOTP, email, subject } = req.body;
  verifyOTP(email, gotOTP, subject);
  await updateOne({
    model: userModel,
    filter: { email, confirmed: false },
    update: { confirmed: true, confirmEmail: new Date() },
  });
  await deleteRedisValue(otp_key(email));
  return successResponse({ res, message: `confirmed` });
};
export const resendOTP = async (req, res) => {
  const { email } = req.body;
  let counterKey = `user::${email}`;
  let banKey = `user::banned::${email}`;
  if (await getRedisValue(banKey)) {
    throw new Error("You are blocked");
  }
  const user = await findOne({
    model: userModel,
    filter: { email, confirmed: false },
  });
  if (!user) {
    throw new Error("User does not exist or already confirmed.");
  }
  let count = await getRedisValue(counterKey);
  count = count + 1;
  if (!count) {
    count = 1;
  }
  await sendOTP(email, "ResendOTP");
  await setRedisValue({ key: counterKey, value: count, ttl: 15 * 60 });
  console.log("Hi?", counterKey);
  console.log(count);
  await updateRedisValue({ key: counterKey, value: count });
  if (count > 3) {
    await setRedisValue({ key: banKey, value: true, ttl: 5 * 60 });
    throw new Error("exceeded 3 tries, try again after 5 minutes");
  }
  successResponse({
    res,
    message: `OTP sent successfully, you have finished ${count} trial(s) and you will be blocked in the 4th trial`,
  });
};
export const signUpWithGmail = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    const client = new OAuth2Client();
    const audience = process.env.AUDIENCE;

    const ticket = await client.verifyIdToken({
      idToken,
      audience: [
        audience, // el array 3shan law 3ndy kaza client id 3shan el app beta3y mwst5dm kaza google project
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
export const login = async (req, res) => {
  let { email, password } = req.body;
  let counterKey = `user::${email}`;
  let banKey = `user::banned::${email}`;
  let user = await findOne({
    model: userModel,
    filter: { email },
  });
  if (!user) {
    throw new Error("Wrong Credentials");
  }
  if (await getRedisValue(banKey)) {
    throw new Error(
      "You have exceeded the number of trials to enter your correct credentials. You are blocked",
    );
  }
  if (user) {
    const isMatched = await compare(password, user.password);
    if (isMatched) {
      const payload = createTokenPayload(user);
      const refresh_token = generateRefreshToken(payload);
      const access_token = generateAccessToken(payload);
      let { istwoStepVerificationEnabled } = user;
      console.log(istwoStepVerificationEnabled);
      if (istwoStepVerificationEnabled == true) {
            let { gotOTP } = req.body;

        if (!gotOTP) {
          // First time: send OTP
          await sendOTP(email, "twoStep");
          return res.status(200).json({
            message:
              "OTP has been sent to your email. Please provide it to complete login",
          }); 
        }  
        await sendOTP(email, "twoStep"); 
        await verifyOTP(email, gotOTP, "twoStep");
        return successResponse({
          res, 
          message: "Valid credentials, OTP verified successfully",
          data: {
            access_token,
            refresh_token,
          },
        });
      }
      return successResponse({
        res,
        message: "welcome to our app",
        data: { access_token, refresh_token },
      });
    } else {
      res.status(400).json({ message: "wrong credentials" });
      if (await getRedisValue(counterKey)) {
        await incrementRedisValue(counterKey);
        if ((await getRedisValue(counterKey)) == 5) {
          await setRedisValue({
            key: banKey,
            value: true,
            ttl: 1 * 60,
          });
          await deleteRedisValue(counterKey);
          throw new Error(
            `You have exceeded the limit of trials, try again after ${await redisValuettl(banKey)} seconds`,
          );
        }
      } else {
        await setRedisValue({
          key: counterKey,
          value: 1,
        });
      }
    }
  }
  console.log(istwoStepVerificationEnabled);
  throw new Error("Something went wrong");
};
export const forgetPassword = async (req, res) => {
  let { email } = req.body;
  let user = await findOne({
    model: userModel,
    filter: { email },
  });
  if (!user) {
    throw new Error("Wrong Credentials");
  }
  await sendOTP(email, "forgetPassword");
  successResponse({ res, message: "OTP sent for resetting your password" });
};
export const resetPassword = async (req, res) => {
  const { email, gotOTP, newPassword } = req.body;
  await verifyOTP(email, gotOTP, "forgetPassword");
  const user = await findOneAndUpdate({
    model: userModel,
    filter: { email },
    update: {
      password: await hash(newPassword, 12),
      changeCredential: new Date(),
    },
    select: { confirmed: true },
  });
  if (!user) {
    throw new Error("User doesn't exist");
  }
  user.password = newPassword;
  successResponse({
    res,
    message: "password reset successfully",
  });
  await deleteRedisValue(otp_key(email, "forgetPassword"));
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
  const { fullName, email, followers, following, profilePic, views, bio } =
    user;
  const followersCount = followers.length;
  const followingCount = following.length;
  return successResponse({
    res,
    data: {
      fullName,
      email,
      followersCount,
      followingCount,
      profilePic,
      views,
      bio,
    },
  });
};
export const editProfile = async (req, res, next) => {
  try {
    const { fullName, bio, profilePic, gender, DOB } = req.body;

    const result = await userModel.updateOne(
      { _id: req.userId },
      { $set: { fullName, bio, profilePic, gender, DOB } },
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
export const updatePassword = async (req, res) => {
  let { oldPassword, newPassword } = req.body;
  const isMatch = await compare(oldPassword, req.user.password);
  if (!isMatch) {
    throw new Error("Wrong Credentials");
  }
  const hashed = await hash(newPassword, 12);
  // lamma mdethash salt rounds 2al 'await has no effect on this expression' 3shan It assumed hash (elly btst2bl string bs) has a non-Promise return
  req.user.password = hashed;
  await req.user.save();
  successResponse({
    res,
    message: "Password Updated Successfully",
  });
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
export const logOut = async (req, res) => {
  const { flag } = req.query;
  if (flag == "all") {
    req.user.changeCredential = new Date();
    //careatnah? hnro7 ba2a fe elauthentication n2olo lama tela2y changeCredential w kaman akbar mn elwa2t elly beystamel feh token , 2olo la2

    await req.user.save();
    await deleteRedisValue(await rediskeys(`${baseRevokeToken(userId)}`));
  } else {
    const key = await revokeToken(req.user.userId, req.user.jti);
    // await redisValueExpire(key, ttl);

    await setRedisValue({
      key,
      value: req.user.jti,
      ttl: config.jwt.access_expiresIn,
    });
    const ttl = await redisValuettl(key);
    // console.log(req.user.jti);
    console.log(key);
    console.log(req.user.userId);
    console.log(req.user.jti);
    console.log(ttl);
  }
  successResponse({ res });
};
export const toggletwoStepVerification = async (req, res) => {
  try {
    let user = await findById({
      model: userModel,
      id: req.userId,
    });
    if (!user) {
      throw new Error("User Doesn't exist");
    }
    let { istwoStepVerificationEnabled } = user;
    user = await findByIdAndUpdate({
      model: userModel,
      id: req.userId,
      update: { istwoStepVerificationEnabled: !istwoStepVerificationEnabled },
      options: { new: true },
    });
    let message = "";
    if (user.istwoStepVerificationEnabled == true) {
      message = "Two step verification enabled";
    } else {
      message = "Two step verification disabled";
    }
    successResponse({ res, message });
  } catch (error) {
    console.log(error, error.stack, error.message);
    throw new Error("Something went wrong");
  }
};
const sendOTP = async (email, subject) => {
  const OTP = await generateOTP();
  await sendEmail({
    from: config.email.email,
    to: email,
    subject: "Hi! this is nodemailer working",
    html: emailTemplate(OTP),
  });
  setRedisValue({
    key: otp_key(email, subject),
    value: await hash(OTP.toString(), 10),
    ttl: 15 * 60,
  });
};
const verifyOTP = async (email, gotOTP, subject) => {
  try {
    if (!gotOTP) {
      throw new Error("invalid credentials");
    }
    console.log(otp_key(email, subject));
    const OTPExists = await getRedisValue(otp_key(email, subject));
    if (!OTPExists) {
      throw new Error("OTP not found or expired");
    }
    if (!(await compare(gotOTP, OTPExists))) {
      throw new Error("Invalid OTP (does not match)");
    }
  } catch (error) {
    console.log(error, error.stack, error.message);
  }
};
