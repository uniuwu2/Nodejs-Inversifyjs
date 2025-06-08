import { controller, httpGet, httpPost } from "inversify-express-utils";
import { Request, Response } from "express";
import { verifyAuthTokenRouter } from "@inversifyjs/infrastructure";
import { Role, User } from "@inversifyjs/domain";
import { ClassStudentService, TYPES, UserService, Variables } from "@inversifyjs/application";
import { inject } from "inversify";
import * as jwt from "jsonwebtoken";
import * as randToken from "rand-token";
@controller("/api/v1")
export class ApiController {
  // This controller can be used to define API endpoints
  // For example, you can add methods here to handle GET, POST, etc.

  // Example method:
  // @httpGet("/example")
  // public getExample(req: Request, res: Response): Response {
  //   return res.json({ message: "This is an example endpoint" });
  // }
  private userService!: UserService;
  private classStudentService!: ClassStudentService;
  private expiredSession: number;
  private tokenKey: string;
  private refreshTokenSize: string;
  constructor(
    @inject(TYPES.UserService) userService: UserService,
    @inject(TYPES.ClassStudentService) classStudentService: ClassStudentService
  ) {
    this.userService = userService;
    this.expiredSession = Variables.EXPIRED_SESSION;
    this.tokenKey = process.env.TOKEN_KEY!;
    this.refreshTokenSize = process.env.REFRESH_TOKEN_SIZE!;
    this.classStudentService = classStudentService;
  }

  @httpGet("/attendance/:token")
  public async checkAttendanceFromQr(req: Request, res: Response) {

    console.log("Checking attendance from QR code");
    // trả về điểm danh thành công
    return res.status(200).json({
      message: "Điểm danh thành công",
      data: {
        userId: req.params.token, // Giả sử token là userId
        timestamp: new Date().toISOString(),
      },
    });
  }

  @httpPost("/react-native-login")
  public async reactNativeLogin(req: Request, res: Response) {
    // Xử lý đăng nhập từ React Native
    const {
      googleId,
      name,
      email,
      picture,
      givenName,
      familyName
    } = req.body;


    let user: User | undefined | null = await this.userService.findByEmail(email);

    if (!user) {
      // Nếu người dùng chưa tồn tại, tạo mới người dùng
      let newUser = await this.userService.createFromReactNative(name, email, picture, givenName, familyName);
      if (newUser) {
        user = await this.userService.findOneById(newUser.id);
      }
    }
    let accessToken: string = jwt.sign({ userId: user?.id }, this.tokenKey, { expiresIn: `${process.env.REMEMBER_TOKEN!}s` });
    let refreshToken = randToken.generate(parseInt(this.refreshTokenSize));
    try {
      if (user) {
        user.refreshToken = refreshToken;
        user.role = { id: user.roleId } as Role;
        if ('student' in user) {
          delete (user as any).student;
        }
        await this.userService.save(user);
      }
    } catch (error) {
      console.error("Error saving user refresh token:", error);
    }

    res.json({
      message: "Đăng nhập thành công",
      user: {
        id: user?.id,
        name: user?.firstName + " " + user?.lastName,
        email: user?.email,
        picture: user?.imagePath,
        role: user?.roleId,
      },
      token: accessToken,
    });
  }

  @httpGet("/get-student-schedule/:id")
  public async getStudentSchedule(req: Request, res: Response) {
    const studentId = req.params.id;
    console.log("Fetching schedule for student ID:", studentId);

    let getStudentSchedule = await this.classStudentService.getStudentSchedule(studentId);
    if (!getStudentSchedule) {
      return res.status(404).json({
        message: "Không tìm thấy lịch học cho sinh viên này",
      });
    }

    //
    let schedule: any[] = [];

    getStudentSchedule.forEach((item: any) => {
      // random color for each course
      let color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      item.courseClass.sessionClass.forEach((session: any) => {
        schedule.push({
          subject: item.courseClass.course.courseName,
          startTime: session.sessionStartTime,
          endTime: session.sessionEndTime,
          room: session.room,
          teacher: item.courseClass.teacher.firstName + " " + item.courseClass.teacher.lastName,
          date: session.sessionDate,
          color: color,
          courseId: item.courseClass.course.id,
        });
      });
    });

    return res.status(200).json({
      message: "Lịch học đã được lấy thành công",
      data: schedule,
    });
  }
}