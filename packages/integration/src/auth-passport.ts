const passport = require('passport');
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { UserService } from "@inversifyjs/application";
import { container } from "./ioc-container";
import { TYPES } from "@inversifyjs/application";
import { User } from "@inversifyjs/domain";
export function serializeUser() {
  
  passport.serializeUser((user: any, done: any) => {
    done(null, user);
  });
  
  passport.deserializeUser((user: any, done: any) => {
    done(null, user);
  });
}

export function initializePassport() {
  
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          done(null, { accessToken, profile });
        } catch (err: any) {
          done(err, err);
        }
      }
    )
  );
}

export default passport;