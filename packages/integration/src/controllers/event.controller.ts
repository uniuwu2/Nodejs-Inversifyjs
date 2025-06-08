import { controller, httpGet, httpPost } from "inversify-express-utils";
import { ActivityService, ActivityStudentService, DateTimeHelper, HttpCode, RouteHelper, TYPES, UserService, Variables } from "@inversifyjs/application";
import { BaseController } from "./base-controller";
import { verifyAuthTokenRouter } from "@inversifyjs/infrastructure";
import { Request, Response } from "express";
import { inject } from "inversify";
import * as QRCode from "qrcode";
import * as jwt from "jsonwebtoken";
import { In, Not } from "typeorm";
const JWT_SECRET = process.env.TOKEN_KEY || "mydevsecretkey123456";

@controller(RouteHelper.EVENT)
export class EventController extends BaseController {
    private userService!: UserService;
    private activityService!: ActivityService;
    private activityStudentService!: ActivityStudentService;
    constructor(
        @inject(TYPES.UserService) userService: UserService,
        @inject(TYPES.ActivityService) activityService: ActivityService,
        @inject(TYPES.ActivityStudentService) activityStudentService: ActivityStudentService
    ) {
        super();
        this.userService = userService;
        this.activityService = activityService;
        this.activityStudentService = activityStudentService;
    }

    @httpGet("/", verifyAuthTokenRouter)
    public async getEvents(request: Request, response: Response): Promise<void> {
        let successMessage: string = "";
        if (request.cookies.messages) {
            successMessage = "「" + request.cookies.messages.user + "」" + request.cookies.messages.message;
            response.clearCookie("messages");
        }
        let startDate: any = request.query.startDate || DateTimeHelper.getPrevDay();
        let endDate: any = request.query.endDate || DateTimeHelper.getPrevDay();
        let user: any = request.query.userSelect || Variables.ALL;
        let status: any = request.query.statusSelect || Variables.ALL;
        let name: any = (request.query.searchField as string)?.trim() || "";
        let page: any = request.query.page || 1;
        let sortBy: any = request.query.sortBy;
        let sort: any = request.query.sort || "ASC";

        try {
            let events = await this.activityService.showActivityList(name, page, this.limitedItem, sortBy, sort, startDate, endDate, status, user);
            let users = await this.userService.getStaffList();
            if (events) {
                response.render(this.routeHelper.getRenderPage(RouteHelper.EVENT), {
                    events: events.list,
                    users: users,
                    searchField: name,
                    limit: this.limitedItem,
                    userSelect: user,
                    statusSelect: status,
                    total: events.total,
                    successMessage,
                    page: events?.pageSize,
                    lastPage: Math.ceil(events.total / this.limitedItem),
                    startDate,
                    endDate,
                    sortBy,
                    sort
                });
            }
        } catch (error: any) {
            this.logger.error(error);
            response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.INTERNAL_SERVER_ERROR));
            return;
        }
    }

    @httpPost("/:id/changeStatus", verifyAuthTokenRouter)
    public async activeEvent(request: Request, response: Response): Promise<void> {
        let eventId: number = Number(request.params.id);
        let active: number = Number(request.body.active);
        try {
            let event = await this.activityService.activeEvent(eventId, active);
            if (event) {
                response.json({
                    status: HttpCode.SUCCESSFUL,
                    message: "Cập nhật trạng thái thành công",
                    event: {
                        id: event.id,
                        active: event.active
                    }
                });
            } else {
                response.status(HttpCode.NOT_FOUND).render(this.routeHelper.getRenderPage(RouteHelper.NOT_FOUND));
            }
        } catch (error: any) {
            this.logger.error(error);
            response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.INTERNAL_SERVER_ERROR));
        }
    }

    @httpPost("/:id/delete", verifyAuthTokenRouter)
    public async deleteEvent(request: Request, response: Response): Promise<void> {
        let eventId: number = Number(request.params.id);
        let pathHref = String(request.body.href);

        try {
            let participant = await this.activityStudentService.find(["student", "activity"],
                {
                    "activityId": eventId
                });
            if (participant && participant.length > 0) {
                response.status(HttpCode.BAD_REQUEST).json({
                    status: HttpCode.BAD_REQUEST,
                    message: "Không thể xóa sự kiện này vì có người tham gia"
                });
                return;
            }
            await this.activityService.delete(eventId);
            return response.cookie("messages", "Đã xoá event").redirect(RouteHelper.EVENT + pathHref);

        } catch (error: any) {
            this.logger.error(error);
            response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.INTERNAL_SERVER_ERROR));
        }
    }

    @httpGet("/event/:id", verifyAuthTokenRouter)
    public async getEventById(request: any, response: any): Promise<void> {
        let eventId: number = Number(request.params.id);
        let name: any = (request.query.searchField as string)?.trim() || "";
        let page: any = request.query.page || 1;
        let sortBy: any = request.query.sortBy;
        let sort: any = request.query.sort || "ASC";
        try {
            let event = await this.activityService.findOne(["user", "student"], {
                "id": eventId
            });
            if (!event) {
                response.status(HttpCode.NOT_FOUND).render(this.routeHelper.getRenderPage(RouteHelper.NOT_FOUND));
                return;
            }
            let participants = await this.activityStudentService.showActivityStudentList(eventId, name, page, this.limitedItem, sortBy, sort);
            const payload = { activityId: eventId }

            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1m" });

            // Tạo URL điểm danh chứa token
            const attendanceUrl = `http://localhost:9999/api/v1/attendance/event/${token}`;

            // Tạo QR code dạng data URL
            const qrImageUrl = await QRCode.toDataURL(attendanceUrl);
            // Lọc ra những sinh viên không có mặt trong hoạt động này
            if (participants) {
            let studentInEvent = participants.list.map(participant => participant.student.id);
                let studentsNotInEvent = await this.userService.find(["student"], {
                    id: Not(In(studentInEvent)),
                    roleId: 4
                }) || [];
                response.render(this.routeHelper.getRenderPage(RouteHelper.EVENT_DETAIL), {
                    event: event,
                    students: participants.list,
                    searchField: name,
                    studentsNotInEvent: studentsNotInEvent,
                    limit: this.limitedItem,
                    total: participants.total,
                    page: participants.pageSize,
                    lastPage: Math.ceil(participants.total / this.limitedItem),
                    qrImageUrl: qrImageUrl,
                    qrExpiresIn: 30, // 60 giây
                    sortBy,
                    sort,
                    currentUser: request.session.userId
                });
            } else {
                response.status(HttpCode.NOT_FOUND).render(this.routeHelper.getRenderPage(RouteHelper.NOT_FOUND));
            }
        } catch (error: any) {
            this.logger.error(error);
            response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.INTERNAL_SERVER_ERROR));
        }
    }

    @httpPost("/event/editStudentStatus", verifyAuthTokenRouter)
    public async editStudentStatus(request: Request, response: Response): Promise<void> {
        let activityId: number = Number(request.body.eventId);
        let studentId: number = Number(request.body.id);
        let status: string = request.body.status;
        try {
            let participant = await this.activityStudentService.findOne([], {
                activityId: activityId,
                studentId: studentId
            });
            if (!participant) {
                response.status(HttpCode.NOT_FOUND).json({
                    status: HttpCode.NOT_FOUND,
                    message: "Không tìm thấy người tham gia"
                });
                return;
            }
            participant.attendanceCheck = Number(status);
            participant.note = request.body.note || null;

            await this.activityStudentService.save(participant);


            response.json({
                code: HttpCode.SUCCESSFUL,
                message: "Cập nhật trạng thái thành công",
                participant: participant
            });
        } catch (error: any) {
            this.logger.error(error);
            response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.INTERNAL_SERVER_ERROR));
        }
    }

    @httpGet("/event/qr/:eventId", verifyAuthTokenRouter)
    public async getEventQrCode(request: Request, response: Response) {
        const eventId = Number(request.params.eventId);

        const payload = {
            eventId: eventId,
            createdAt: Date.now()
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30s" });

        const attendanceUrl = `https://3577-2402-800-63b7-a742-f89a-6e98-2647-ca94.ngrok-free.app/api/v1/attendance/${token}`;
        return response.json({ token, url: attendanceUrl });
    }

    @httpPost("/event/deleteCheckedStudents", verifyAuthTokenRouter)
    public async deleteCheckedStudents(request: Request, response: Response) {
        let activityId: number = Number(request.body.eventId);
        let participantIds: any[] = request.body.ids || [];
        try {
            if (participantIds.length === 0) {
                return response.status(HttpCode.BAD_REQUEST).json({
                    status: HttpCode.BAD_REQUEST,
                    message: "Không có người dùng nào được chọn để xóa"
                });
            }
            if (participantIds[0] == "all") {
                // Nếu chọn "Tất cả", lấy tất cả người dùng đã điểm danh trong hoạt động này
                let allParticipants = await this.activityStudentService.find([], {
                    activityId: activityId,
                });
                if (!allParticipants || allParticipants.length === 0) {
                    return response.status(HttpCode.NOT_FOUND).json({
                        status: HttpCode.NOT_FOUND,
                        message: "Không tìm thấy người dùng nào để xóa"
                    });
                }
                participantIds = allParticipants.map(participant => participant.studentId);
            }

            let participants = await this.activityStudentService.find([], {
                studentId: In(participantIds),
                activityId: activityId,
            });
            if (!participants || participants.length === 0) {
                return response.status(HttpCode.NOT_FOUND).json({
                    status: HttpCode.NOT_FOUND,
                    message: "Không tìm thấy người dùng nào để xóa"
                });
            }
            for (let participant of participants) {
                await this.activityStudentService.delete(participant.id);
            }

            response.json({
                code: HttpCode.SUCCESSFUL,
                message: "Đã xóa thành công người dùng đã điểm danh",
                deletedCount: participantIds.length
            });
        } catch (error: any) {
            this.logger.error(error);
            response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.INTERNAL_SERVER_ERROR));
        }
    }

    @httpPost("/event/addStudents", verifyAuthTokenRouter)
    public async addStudentsToEvent(request: Request, response: Response) {
        console.log(request.body);
    }
}
