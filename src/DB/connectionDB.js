import mongoose from "mongoose"
import configServices from "../config/configServices.js"
const URI = configServices.db.uri;

export const checkConnectionDB = async () => {
    try {
        await mongoose.connect(URI)
        console.log("connected to the database");
    } catch (error) {
        console.log("failed", error);
    }
} 