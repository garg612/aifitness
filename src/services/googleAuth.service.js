import { OAuth2Client } from "google-auth-library";
import {sociallogin} from "./auth.service.js";
import logger from "../utils/logger.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuthService=async(idToken)=>{

    const ticket=await client.verifyIdToken({
        idToken,
        audience:process.env.GOOGLE_CLIENT_ID
    });

    const payload=ticket.getPayload();

    const {email,name,sub}  =payload;

    logger.debug(`Google payload: ${JSON.stringify(payload)}`);
    if (!email || !name || !sub) {
        const error = new Error("Invalid Google token payload.");
        error.statusCode = 400;
        throw error;
  }

    const result= await sociallogin({
        email,
        fullName:name,
        provider:"google",
        providerId:sub
    });

    return result;
};
