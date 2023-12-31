import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        // check for token existence
        if (!token) {
            throw new UnauthorizedException('Authentication Invalid');
        }

        try {
            // check for token lifetime and correctness
            const payload = await this.jwtService.verifyAsync(
                token,
                { secret: process.env.TOKEN_SECRET }
            );
            request['user'] = payload;
        } catch {
            // lifetime expired , not valid with token secret
            throw new UnauthorizedException('Authentication Invalid');
        }
        return true;
    }
    // helper method for a cleaner code
    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}