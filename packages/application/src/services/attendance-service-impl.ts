import { Attendance, ClassStudent } from "@inversifyjs/domain";
import { AttendanceRepository } from "@inversifyjs/infrastructure";
import { injectable } from "inversify";
import { AbstractService } from "./abstract-service";
import { AttendanceService } from "./attendance-service.interface";
import { Brackets } from "typeorm";

@injectable()
export class AttendanceServiceImpl extends AbstractService<Attendance, AttendanceRepository> implements AttendanceService {

    public async findStudentsByCourseClassId(
        name: any,
        sessionId: any,
        page: any,
        limit: any,
        sortBy: any,
        sort: any
    ): Promise<{
        list: any[];
        total: number;
        page: number;
        pageSize: number;
    }> {
        // Lấy attendance theo sessionId
        const attendance = await this.repository?.findOne([],{
            sessionId: Number(sessionId) 
        });
        if (!attendance) return { list: [], total: 0, page, pageSize: limit };

        // // Lấy danh sách student_attendance từ JSON
        // const attendanceList: {
        //     student_id: number;
        //     status: string | null;
        //     note: string;
        // }[] = attendance.studentAttendance || [];
        // console.log("Attendance:", attendanceList);

        // // Lấy ra tất cả student_id trong attendanceList
        // let studentIds = attendanceList.map((s) => s.student_id);

        // // // Nếu có name filter, lọc danh sách studentIds theo tên/email/student_number
        // if (name.trim()) {
        //     const keyword = `%${name.toLowerCase()}%`;

        //     const filteredUsers = await this.userRepo
        //         .createQueryBuilder("user")
        //         .leftJoinAndSelect("user.student", "student")
        //         .where("user.id IN (:...studentIds)", { studentIds })
        //         .andWhere(
        //             new Brackets(qb => {
        //                 qb.where("LOWER(user.firstName) LIKE :keyword", { keyword })
        //                     .orWhere("LOWER(user.lastName) LIKE :keyword", { keyword })
        //                     .orWhere("LOWER(user.email) LIKE :keyword", { keyword })
        //                     .orWhere("student.student_number LIKE :keyword", { keyword });
        //             })
        //         )
        //         .getMany();

        //     studentIds = filteredUsers.map((u: { id: any; }) => u.id);
        // }
        // console.log("Filtered Student IDs:", studentIds);
        // Query lại userRepo lấy user đã lọc, áp dụng phân trang + sort
        // const qb = this.userRepo
        //     .createQueryBuilder("user")
        //     .leftJoinAndSelect("user.student", "student")
        //     .where("user.id IN (:...studentIds)", { studentIds });

        // Xử lý sortBy
        // let orderColumn = "";
        // switch (sortBy) {
        //     case "firstName":
        //         orderColumn = "user.firstName";
        //         break;
        //     case "lastName":
        //         orderColumn = "user.lastName";
        //         break;
        //     case "email":
        //         orderColumn = "user.email";
        //         break;
        //     case "studentNumber":
        //         orderColumn = "student.student_number";
        //         break;
        //     default:
        //         orderColumn = "user.firstName";
        //         break;
        // }
        // qb.orderBy(orderColumn, sort.toUpperCase() === "DESC" ? "DESC" : "ASC");

        // // Phân trang
        // qb.skip((page - 1) * limit).take(limit);

        // const [students, total] = await qb.getManyAndCount();

        // Ghép thông tin điểm danh (status, note) từ attendanceList vào
        // const resultList = students.map(student => {
        //     const att = attendanceList.find(a => a.student_id === student.id);
        //     return {
        //         student_id: student.id,
        //         firstName: student.firstName,
        //         lastName: student.lastName,
        //         email: student.email,
        //         student_number: student.student?.student_number || "",
        //         status: att?.status || null,
        //         note: att?.note || "",
        //     };
        // });

        return {
            list: [],
            total: 0, // total,
            page,
            pageSize: limit,
        };
    }


    public getRepositoryName(): string {
        return "AttendanceRepositoryImpl";
    }
}
