import { HTTPException } from "hono/http-exception";

type ErrorFunction = (c: any, next: any) => Promise<any>;

const asyncHandler = (errfunction:ErrorFunction) => {
  return (c:any, next:any) => {
    try {
       errfunction(c, next);
    } catch (error) {
      throw new HTTPException(401, { message: "Something Went Wrong" });
    }
  };
};

export default asyncHandler