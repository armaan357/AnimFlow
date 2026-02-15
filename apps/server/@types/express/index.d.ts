import  Express, { Request } from 'express';

declare global{
    namespace Express{
        interface Request{
            userId?: string;
            session: {
                passport?: {
                    user?: {
                        id: string;
                        email: string;
                        password: string;
                        userName: string;
                    }
                };
            };
        }
    }
}