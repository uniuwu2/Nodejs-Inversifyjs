export class Message {
    public static readonly AUTHENTICATION_FAILED: string = "Xác thực không thành công!!!";
    public static readonly AUTHENTICATION_SUCCESSFULLY: string = "Xác thực thành công!!!";
    public static readonly UNAUTHORIZED: string = "Không có quyền truy cập!!!";
    public static readonly FORBIDDEN: string = "Không có quyền truy cập!!!";

    public static readonly ID_NOT_NULL: string = "ID không được null";
    public static readonly USERNAME_NOT_EMPTY: string = "Tên đăng nhập không được để trống";
    public static readonly USER_NOT_FOUND: string = "Người dùng không tồn tại";
    public static readonly CAN_NOT_CREATE_USER: string = "Không thể tạo người dùng";
    public static readonly CAN_NOT_CHANGE_PASSWORD: string = "Không thể thay đổi mật khẩu";

    public static readonly LOGIN_FAIL: string = "Đăng nhập thất bại!";
    public static readonly LOGIN_SUCCESS: string = "Đăng nhập thành công!";
    public static readonly USER_NOT_EXITS: string = "Người dùng không tồn tại!";
    public static readonly LOGOUT_SUCCESS: string = "Đăng xuất thành công!";

    // Login
    public static readonly INVALID_USER_NAME: string = "Email không hợp lệ!";
    public static readonly INVALID_PASSWORD: string = "Mật khẩu không hợp lệ!";
    public static readonly USER_IS_BLOCKED: string = "Tài khoản đã bị khóa!";
    public static readonly INVALID_CREDENTIAL: string = "Thông tin đăng nhập không hợp lệ!";

    // SIGNUP
    public static readonly PASSWORD_IS_LENGTH: string = "Mật khẩu phải có ít nhất 6 ký tự!";
    public static readonly INVALID_EMAIL: string = "Email không hợp lệ!";
    public static readonly INVALID_FIRST_NAME: string = "Họ không được để trống!";
    public static readonly INVALID_LAST_NAME: string = "Tên không được để trống!";
    public static readonly WRONG_EMAIL_FORMAT: string = "Email không đúng định dạng!";
    public static readonly PASSWORD_NOT_MATCH: string = "Mật khẩu không khớp!";
    public static readonly EMAIL_IS_EXIST: string = "Email đã tồn tại!";
    public static readonly MAX_ALLOW_AVATAR_SIZE: string = "Kích thước ảnh đại diện tối đa là 2MB!";
    public static readonly INVALID_FILE: string = "Tệp không hợp lệ!";

    // SUCCESSFULLY
    public static readonly CREATED_SUCCESS: string = "Tạo mới thành công.";
    public static readonly DELETED_SUCCESS: string = "Xóa thành công.";
    public static readonly UPDATED_SUCCESS: string = "Cập nhật thành công.";

}