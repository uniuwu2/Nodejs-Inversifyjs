export class Variables {
    public static readonly TOKEN_LIFETIME = 24 * 60 * 60 * 1000;
    public static readonly PAGE: number = 1;
    public static readonly REMEMBER_SESSION: number = (Number(process.env.REMEMBER_TOKEN!) || 365 * 24 * 60 * 60) * 1000;
    public static readonly EXPIRED_SESSION: number = (Number(process.env.EXPIRED_TOKEN!) || 2 * 60 * 60) * 1000;
    public static readonly SALT_ROUNDS: number = 10;
    public static readonly ALL: string = "ALL";
    public static readonly ACTIVE: number = 1;
    public static readonly INACTIVE: number = 0;
    public static readonly VALID_USER: any = [
        {
            name: "All",
            value: this.ALL,
        },
        {
            name: "Active",
            value: this.ACTIVE,
        },
        {
            name: "Inactive",
            value: this.INACTIVE,
        },
    ];
}