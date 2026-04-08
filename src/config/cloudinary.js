import { v2 as cloudinary } from "cloudinary";
import {config} from "./configServices.js";

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.cloud_api_key,
  api_secret: config.cloudinary.cloud_api_secret,
});
export default cloudinary;
