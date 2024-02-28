import cors from 'cors'

export const CorsConfig = cors({
    origin:"*",
    methods: "GET",
    credentials: true,
    optionsSuccessStatus:200
})