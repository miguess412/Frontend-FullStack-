export interface User {
    id?: number;
    nombre: string;
    email: string;
    password?: string;
    rol_id?: number;
    rol?: string;        
    telefono?: string;
    activo?: boolean;
    created_at?: Date;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface LoginRequest {
    email: string;
    password: string;
}