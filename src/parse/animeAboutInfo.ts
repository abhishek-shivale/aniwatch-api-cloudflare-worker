import asyncHandler from "../config/asyncHandler";


export const ScrapeanimeAboutInfo = asyncHandler(async(c,next)=>{
    c.text('api is working')
})