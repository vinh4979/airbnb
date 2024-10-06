import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";


@Injectable()
export class RegisterInterceptor implements NestInterceptor {
    intercept(
        context: ExecutionContext, 
        next: CallHandler): Observable<any> | Promise<Observable<any>> {

        console.log("interceptor", context.getClass().name);
        return next.handle().pipe(map(data => {
            const user = {...data, avatar: "123" as string};
            console.log("interceptor", user);
            return user;
        }));
    }
    }