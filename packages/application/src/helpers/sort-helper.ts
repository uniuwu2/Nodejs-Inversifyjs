import { injectable } from "inversify";

@injectable()
export class SortHelper {
    public static sortDailyStatistics(dailyStatistics: any[], sortBy: string = 'date', sort: string = 'ASC') {
        dailyStatistics.sort((a, b) => {
            let compareValueA;
            let compareValueB;

            switch (sortBy) {
                case 'date':
                    compareValueA = a.date;
                    compareValueB = b.date;
                    break;
                case 'attended':
                    compareValueA = a.attended;
                    compareValueB = b.attended;
                    break;
                case 'absent':
                    compareValueA = a.absent;
                    compareValueB = b.absent;
                    break;
                case 'notMarked':
                    compareValueA = a.notMarked;
                    compareValueB = b.notMarked;
                    break;
                case 'attendanceRate':
                    compareValueA = a.attendanceRate;
                    compareValueB = b.attendanceRate;
                    break;
                default:
                    compareValueA = a.date;
                    compareValueB = b.date;
                    break;
            }

            if (typeof compareValueA === 'string') {
                // So sánh string
                return sort === 'ASC'
                    ? compareValueA.localeCompare(compareValueB)
                    : compareValueB.localeCompare(compareValueA);
            } else {
                // So sánh số
                return sort === 'ASC'
                    ? compareValueA - compareValueB
                    : compareValueB - compareValueA;
            }
        });
    }

    public static sortStudentList(studentList: any[], sortBy: string = 'name', sort: string = 'ASC') {
        studentList.sort((a, b) => {
            let compareValueA;
            let compareValueB;

            switch (sortBy) {
                case 'lastName':
                    compareValueA = a.name.toLowerCase();
                    compareValueB = b.name.toLowerCase();
                    break;
                case 'firstName':
                    compareValueA = a.name.toLowerCase();
                    compareValueB = b.name.toLowerCase();
                    break;
                case 'email':
                    compareValueA = a.email.toLowerCase();
                    compareValueB = b.email.toLowerCase();
                    break;
                case 'studentNumber':
                    compareValueA = a.studentNumber.toLowerCase();
                    compareValueB = b.studentNumber.toLowerCase();
                    break;
                case 'studentClass':
                    compareValueA = a.studentClass.name.toLowerCase();
                    compareValueB = b.studentClass.name.toLowerCase();
                    break;
                case 'attendanceRate':
                    compareValueA = a.attendanceRate;
                    compareValueB = b.attendanceRate;
                    break;
                case 'attendance':
                    compareValueA = a.attendance;
                    compareValueB = b.attendance;
                    break;
                case 'absent':
                    compareValueA = a.absent;
                    compareValueB = b.absent;
                    break;
                default:
                    compareValueA = a.name.toLowerCase();
                    compareValueB = b.name.toLowerCase();
                    break;
            }

            if (typeof compareValueA === 'string') {
                // So sánh string
                return sort === 'ASC'
                    ? compareValueA.localeCompare(compareValueB)
                    : compareValueB.localeCompare(compareValueA);
            } else {
                // So sánh số
                return sort === 'ASC'
                    ? compareValueA - compareValueB
                    : compareValueB - compareValueA;
            }
        });
    }

    public static sortCourseList(courseList: any[], sortBy: string = 'courseName', sort: string = 'ASC') {
        courseList.sort((a, b) => {
            let compareValueA;
            let compareValueB;

            switch (sortBy) {
                case 'courseName':
                    compareValueA = a.name.toLowerCase();
                    compareValueB = b.name.toLowerCase();
                    break;
                case 'courseCode':
                    compareValueA = a.code.toLowerCase();
                    compareValueB = b.code.toLowerCase();
                    break;
                case 'semester':
                    compareValueA = a.semester.toLowerCase();
                    compareValueB = b.semester.toLowerCase();
                    break;
                case 'teacher':
                    compareValueA = a.teacher.toLowerCase();
                    compareValueB = b.teacher.toLowerCase();
                    break;
                case 'group':
                    compareValueA = a.group.toLowerCase();
                    compareValueB = b.group.toLowerCase();
                    break;
                case 'totalAttendance':
                    compareValueA = a.totalAttendance;
                    compareValueB = b.totalAttendance;
                    break;
                case 'totalAbsent':
                    compareValueA = a.totalAbsent;
                    compareValueB = b.totalAbsent;
                    break;
                case 'attendanceRate':
                    compareValueA = a.attendanceRate;
                    compareValueB = b.attendanceRate;
                    break;
                default:
                    compareValueA = a.name.toLowerCase();
                    compareValueB = b.name.toLowerCase();
                    break;
            }

            if (typeof compareValueA === 'string') {
                // So sánh string
                return sort === 'ASC'
                    ? compareValueA.localeCompare(compareValueB)
                    : compareValueB.localeCompare(compareValueA);
            } else {
                // So sánh số
                return sort === 'ASC'
                    ? compareValueA - compareValueB
                    : compareValueB - compareValueA;
            }
        });
    }
}