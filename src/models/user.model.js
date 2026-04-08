import mongoose from "mongoose";
import { GenderEnum, ProviderEnum, roleEnum } from "../config/enums/user.enum.js";
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      // required: true,
      trim: true,
      minLength: 3,
      maxLength: 10,
    },
    lastName: {
      type: String,
      // required: true,
      trim: true,
      minLength: 3,
      maxLength: 10,
    }, 
    email: {
      type: String,
      required:true
    },
    password: {
      type: String,
      required: function () {
        return this.provider == ProviderEnum.system ? true : false;
      }
    },
    cpassword: {
      type: String,
      required: function () {
        return this.provider == ProviderEnum.system ? true : false;
      }
    },
    provider: {
      type: Number,
      required: true,
      enum: [ProviderEnum.system, ProviderEnum.google],
      default: ProviderEnum.google,
    },
    followers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref:"User"
    }
    ],
    following: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    profilePic: {
      type: String
    },
    album: {
      type:[String]
    },
    bio: {
      type: String,
      maxLength:500
    },
    gender: {
      type: String,
      enum:[GenderEnum.female,GenderEnum.male]
    },
    role: {
      type: Number,
      enum:[roleEnum.user, roleEnum.admin],
      default:roleEnum.user
    },
    confirmEmail: {
      type:Date
    },
    views: {
      type:Number
    },
    DOB: {
      type: Date,
      required:true
    },
    changeCredential: {
      type:Date //lma ne3ml log out dah hnsayev feeh elwa2t blzbt 3shan ne3raf b3d keda eluser beysta3mel el token 2bl wla b3d, law b3d? no, invalid❌
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
    istwoStepVerificationEnabled: {
      type: Boolean,
      default: false,
    },

  },
  {
    timestamps: true,
    strictQuery: true,
    toJSON: { virtuals: true },
  },
);

userSchema.virtual("fullName").set(function (value) {
  console.log(value);
  const [firstName, lastName] = value.split(" ");
  this.set({ firstName, lastName });
});
userSchema.virtual("fullName").get(function () {
  return this.firstName + " " + this.lastName;
});
export const userModel =
  mongoose.model("User", userSchema) || mongoose.model.user;
