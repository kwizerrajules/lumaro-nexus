
export interface StaffPayload {
    id: string;
    email: string;
    role: string;
    names: string, 
    permissions?: string[];
}

export interface UserPayload {
    id: string;
    email: string;
    role: string;
    permissions?: string[];
}
