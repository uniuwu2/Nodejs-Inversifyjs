import { injectable } from "inversify";
import * as Moment from "moment";
import { Variables } from "../constants/variables";

/**
 * Time Helper to get time
 */
@injectable()
export class DateTimeHelper {
    // Get first day in current month
    public static getFirstDay(): Date {
        return Moment().subtract(1, "days").format("YYYY/MM/DD") as any;
    }
    // Get first day in current month
    public static getLastDay(prevDay: number = Variables.ONE_WEEK_AGO): Date {
        return Moment().subtract(prevDay, "days").format("YYYY/MM/DD") as any;
    }

    // Format type YYYY/MM/DD HH:MM:SS
    public static formatDateTime(date: Date): string {
        return Moment(date).format("YYYY/MM/DD HH:mm:ss");
    }

    public static formatDisplay(date: Date, pattern: string): string {
        return Moment(date).format(pattern);
    }

    public static formatFirstTime(text: string): number {
        return new Date(text).setHours(0, 0, 0);
    }

    public static formatLastTime(text: string): number {
        return new Date(text).setHours(23, 59, 59);
    }

    public static getPrevDay(): Date {
        return new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1);
    }

    public static now(): Date {
        return Moment().format("YYYY/MM/DD") as any;
    }

    public static formatDateTimePM(date: Date): string {
        return Moment(date).format("YYYY/MM/DD h:mm:ss A");
    }
}
