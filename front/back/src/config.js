import { config } from "dotenv"
config()

export default{
    port: process.env.PORT || 3030,
    db1: {
        dbUser: process.env.DB_USER || "",
        dbPassword: process.env.DB_PASSWORD || "",
        dbServer: process.env.DB_SERVER || "",
        dbDatabase: process.env.DB_DATABASE || "",
    },
    db2: {
        dbUser: process.env.DB_USER || "",
        dbPassword: process.env.DB_PASSWORD || "",
        dbServer: process.env.DB_SERVER || "",
        database: process.env.DB2_DATABASE || ""
    }
}