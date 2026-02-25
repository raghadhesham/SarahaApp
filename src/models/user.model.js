import mongoose from "mongoose";
import { GenderEnum, ProviderEnum } from "../config/enums/user.enum.js";
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
    bio: {
      type: String,
      maxLength:500
    },
    gender: {
      type:[GenderEnum.female,GenderEnum.male]
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
    }

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
