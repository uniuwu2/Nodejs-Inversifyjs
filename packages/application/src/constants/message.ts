export class Message {
    public static readonly AUTHENTICATION_FAILED: string = "Authentication failed !!!";
    public static readonly AUTHENTICATION_SUCCESSFULLY: string = "Authentication successfully.";
    public static readonly UNAUTHORIZED: string = "Unauthorized.";
    public static readonly FORBIDDEN: string = "Forbidden.";

    public static readonly ID_NOT_NULL: string = "ID could not be null !!!";
    public static readonly USERNAME_NOT_EMPTY: string = "User name could not null or emtpy";
    public static readonly USER_NOT_FOUND: string = "User not found";
    public static readonly NOT_PROCESS: string = "Not Process";
    public static readonly CAN_NOT_CREATE_USER: string = "The system could not create user";
    public static readonly CAN_NOT_CHANGE_PASSWORD: string = "The system could not change the password";

    public static readonly REQUIRE_TOKEN: string = "A token is required for authentication";
    public static readonly ACCESS_TOKEN_SUCCESS: string = "Access token success!";
    public static readonly INVALID_TOKEN: string = "Invalid Token!";
    public static readonly LOGIN_FAIL: string = "Loggin fail!";
    public static readonly LOGIN_SUCCESS: string = "Loggin success!";
    public static readonly CAN_NOT_GET_ACCESS_TOKEN: string = "Can not get access token!";
    public static readonly CAN_NOT_GET_REFRESH_TOKEN: string = "Can not get refresh token!";
    public static readonly INVALID_ACCESS_TOKEN: string = "Invalid access token.";
    public static readonly INVALID_REFRESH_TOKEN: string = "Invalid refresh token.";
    public static readonly USER_NOT_EXITS: string = "User does not exist.";
    public static readonly GENERATE_TOKEN_FAIL: string = "Generate new token fail!";
    public static readonly REFRESH_TOKEN_SUCCESS: string = "Refresh token success!";
    public static readonly CAN_NOT_VERIFY_TOKEN: string = "Cannot verify token!";
    public static readonly LOGOUT_SUCCESS: string = "logged out Successfully!";

    // Login
    public static readonly INVALID_USER_NAME: string = "Invalid user name!";
    public static readonly INVALID_PASSWORD: string = "Invalid password!";
    public static readonly USER_IS_BLOCKED: string = "User is blocked!";
    public static readonly INVALID_CREDENTIAL: string = "Invalid credential!";

    // SIGNUP
    public static readonly PASSWORD_IS_LENGTH: string = "Password must be at least 6 characters!";
    public static readonly INVALID_EMAIL: string = "Email is required!";
    public static readonly INVALID_FIRST_NAME: string = "Invalid first name!";
    public static readonly INVALID_LAST_NAME: string = "Invalid last name!";
    public static readonly WRONG_EMAIL_FORMAT: string = "Email format is invalid!";
    public static readonly PASSWORD_NOT_MATCH: string = "Password not match!";
    public static readonly EMAIL_IS_EXIST: string = "Email is already exist!";
    public static readonly USER_NAME_IS_EXIST: string = "User name is already exist!";
    public static readonly MAX_ALLOW_AVATAR_SIZE: string = "Avatar size must be less than 2MB!";
    public static readonly INVALID_FILE: string = "Invalid file!";

    // SUCCESSFULLY
    public static readonly CREATED_SUCCESS: string = "Created successfully.";
    public static readonly DELETED_SUCCESS: string = "Deleted successfully.";
    public static readonly UPDATED_SUCCESS: string = "Updated successfully.";

}