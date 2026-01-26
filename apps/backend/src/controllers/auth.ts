import { Request, Response } from 'express';
import { AuthService } from '../services/auth.js';

const authService = new AuthService();

export class AuthController {
    public async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            const result = await authService.login(email, password);

            if (result) {
                return res.json(result);
            } else {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
        } catch (error: any) {
            if (error.message === 'Server misconfiguration') {
                return res.status(500).json({ error: error.message });
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
