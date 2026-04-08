import { hash } from "bcrypt";
import { findByIdAndDelete } from "../../DB/database.repository.js";
import { userModel } from "../../models/user.model.js";
import { successResponse } from "../../common/utils/index.js";

export const deleteUser = async (req,res) => {
    try {
        const { userId } = req.body;
        const deletedUser= await findByIdAndDelete({
        model: userModel,
        id:userId
    })
    successResponse({res, message:`user ${deletedUser.fullName} is deleted successfully`})
    } catch (error) {
        throw new Error(error);
    } 
}