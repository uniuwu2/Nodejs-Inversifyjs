import * as express from "express";
import * as jwt from "jsonwebtoken";
import { EncryptHelper, HttpCode, RouteHelper, TYPES, UserService, Variables } from "@inversifyjs/application";
import { container } from "@inversifyjs/integration";
import { DataSourceConnection, User } from "@inversifyjs/domain";

export async function verifyAuthTokenRouter(request: express.Request, response: express.Response, next: () => void) {
    let token = request.cookies.wacts;
    let userId = (request.session as any).userId;

    if (!token || (!request.cookies.wacts && request.path != RouteHelper.LOGIN)) {
        destroySession(request, response);
        return response.clearCookie("wacts", { maxAge: 0 }).status(HttpCode.UNAUTHORIZATION).redirect(RouteHelper.LOGIN);
    }

    try {
        let decryptedToken = EncryptHelper.decryptToken(token);
        let jwtPayload = jwt.verify(decryptedToken, process.env.TOKEN_KEY!) as {
            userId: number;
            remember: string;
        };
        let userServices = container.get<UserService>(TYPES.UserService);
        let refreshUserDecoded = await userServices.findById(jwtPayload.userId, ["role"]);

        if (!refreshUserDecoded?.active || (userId && userId !== jwtPayload.userId) || userId === undefined) {
            if (jwtPayload.remember === undefined || (jwtPayload.remember === "on" && !request.session.cookie.expires) || userId !== jwtPayload.userId) {
                destroySession(request, response);
                return response.clearCookie("wacts", { maxAge: 0 }).status(HttpCode.UNAUTHORIZATION).redirect(RouteHelper.LOGIN);
            }
        }

        if (jwtPayload.remember === "on") {
            response.cookie("wacts", token, { maxAge: Variables.REMEMBER_SESSION });
        } else {
            response.cookie("wacts", token, { maxAge: Variables.EXPIRED_SESSION });
        }

        response.locals.jwtPayload = { ...jwtPayload, user: refreshUserDecoded, defaultLanguage: process.env.DEFAULT_LANGUAGE || "ja" };
        return next();
    } catch (err: any) {
        console.log("err", err);
        return response.status(HttpCode.UNAUTHORIZATION).redirect(RouteHelper.LOGIN);
    }
}

export async function destroySession(request: express.Request, response: express.Response) {
    let ds = container.get<DataSourceConnection>(TYPES.DataSourceConnect).getDataSource();
    let sessionRepository: any = ds?.getRepository("session");
    const sessionId = request.session.id;
    await sessionRepository.delete({ id: sessionId });
}

export function checkPermissions(permissions: number[]) {
    return function (request: express.Request, response: express.Response, next: () => void) {
        let currentUser = response.locals.jwtPayload.user;
        let matchedPermission: boolean = false;
        if (currentUser) matchedPermission = permissions.includes(currentUser.role.id);
        if (matchedPermission) {
            return next();
        }
        return response.redirect(RouteHelper.INDEX + RouteHelper.UNAUTHORIZATION);
    };
}