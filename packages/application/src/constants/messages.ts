export class Messages {

    // Course 
    public static readonly IMPORT_COURSE_SUCCESS = "Nhập môn học thành công!";
    public static readonly CREATE_COURSE_SUCCESS = "Tạo môn học thành công!";
    public static readonly UPDATE_COURSE_SUCCESS = "Sửa môn học thành công!";
    public static readonly DELETE_COURSE_SUCCESS = "Xóa môn học thành công!";
    public static readonly COURSE_NAME_REQUIRED = "Tên môn học là bắt buộc!";
    public static readonly COURSE_CODE_REQUIRED = "Mã môn học là bắt buộc!";
    public static readonly COURSE_CREDITS_REQUIRED = "Số tín chỉ môn học là bắt buộc!";
    public static readonly COURSE_EXISTED = "Môn học đã tồn tại!";
    public static readonly COURSE_NOT_FOUND = "Môn học không tồn tại!";
    public static readonly IMPORT_COURSE_FAILED = "Nhập môn học thất bại!";

    // File
    public static readonly FILE_NOT_FOUND = "Không tìm thấy tệp!";
    public static readonly IMPORT_FILE_SUCCESS = "Nhập tệp thành công!";

    // Image
    public static readonly IMAGE_NOT_FOUND = "Không tìm thấy hình ảnh!";
    public static readonly IMAGE_SIZE_TOO_LARGE = "Kích thước hình ảnh quá lớn!";
    public static readonly UPLOAD_IMAGE_SUCCESS = "Tải lên hình ảnh thành công!";

    // User
    public static readonly USER_NOT_FOUND = "Người dùng không tồn tại!";
    public static readonly USER_EXISTED = "Người dùng đã tồn tại!";
    public static readonly USER_EMAIL_REQUIRED = "Email là bắt buộc!";
    public static readonly USER_PASSWORD_REQUIRED = "Mật khẩu là bắt buộc!";
    public static readonly USER_UPDATE_SUCCESS = "Cập nhật người dùng thành công!";
    public static readonly USER_FIRST_NAME_REQUIRED = "Họ người dùng là bắt buộc!";
    public static readonly USER_LAST_NAME_REQUIRED = "Tên người dùng là bắt buộc!";
    public static readonly USER_PASSWORD_MUST_BE_6_CHARACTERS = "Mật khẩu phải có ít nhất 6 ký tự!";
    public static readonly USER_PASSWORD_MISMATCH = "Mật khẩu không khớp!";
    public static readonly TEACHER_NOT_FOUND = "Không tìm thấy giảng viên!";
    public static readonly USER_CONFIRM_PASSWORD_REQUIRED = "Xác nhận mật khẩu là bắt buộc!";
    public static readonly EMAIL_ALREADY_EXIST = "Email đã tồn tại!";
    public static readonly USER_CREATE_SUCCESS = "Tạo người dùng thành công!";
    public static readonly USER_DELETE_SUCCESS = "Xóa người dùng thành công!";
    public static readonly USER_ACTIVE_SUCCESS = "Kích hoạt người dùng thành công!";
    public static readonly USER_INACTIVE_SUCCESS = "Vô hiệu hóa người dùng thành công!";
    //Course Class
    public static readonly CLASS_NOT_FOUND = "Lớp học không tồn tại!";
    public static readonly DELETE_STUDENT_SUCCESS = "Xóa sinh viên thành công!";
    public static readonly DELETE_CLASS_SUCCESS = "Xóa lớp học thành công!";

    // Student
    public static readonly STUDENT_NOT_FOUND = "Không tìm thấy sinh viên!";
    public static readonly ADD_STUDENT_SUCCESS = "Thêm sinh viên thành công!";


    // Session Class
    public static readonly EDIT_SESSION_CLASS_SUCCESS = "Sửa lớp học thành công!";
    public static readonly SESSION_CLASS_EXISTED = "Lớp học đã tồn tại!";
    public static readonly CREATE_SESSION_CLASS_SUCCESS = "Tạo lớp học thành công!";
    public static readonly STUDENT_EXISTED_IN_SESSION = "Sinh viên đã tồn tại trong lớp học!";
    public static readonly STUDENT_NOT_EXISTED_IN_SESSION = "Sinh viên không tồn tại trong lớp học!";
    public static readonly ADD_STUDENT_TO_SESSION_SUCCESS = "Thêm sinh viên vào lớp học thành công!";
    public static readonly STUDENT_EXISTED_IN_CLASS = "Sinh viên đã tồn tại trong lớp học!";
    public static readonly SESSION_NOT_FOUND = "Không tìm thấy lớp học!";
    public static readonly STUDENT_ATTENDED = "Sinh viên đã điểm danh rồi!";
    public static readonly STUDENT_ATTENDED_SUCCESS = "Điểm danh thành công!";
    public static readonly SESSION_EXPIRED = "Mã lớp học đã hết hạn!";
    

    public static readonly USER_IN_CLASS_OR_EVENT = "Người dùng đang trong lớp học hoặc sự kiện, không thể xóa!";
    public static readonly CLASS_GROUP_REQUIRED = "Nhóm lớp học là bắt buộc!";
    public static readonly CLASS_SCHEDULE_REQUIRED = "Lịch học là bắt buộc!";
    public static readonly CLASS_MAX_STUDENT_REQUIRED = "Số lượng sinh viên tối đa là bắt buộc!";
    public static readonly CLASS_EXISTED = "Lớp học đã tồn tại!";
}