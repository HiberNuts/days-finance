export interface User {
    id: string,
    email: string;
    role: string;
    password?: string;
    organizationId?: string;
    resetToken?: string;
    createdAt?: Date;
    updatedAt?: Date;
    resetTokenExpiry?: Date;
    status?: 'ACCEPTED' | 'PENDING'; // Add organizationId property with optional chaining
}

export interface Organization {
    id: string;
    companyName: string;
    address: string;
    country: string;
    city: string;
    state: string;
    zipcode: string;
    users: User[]
}

export interface Session {
    user: {
        email: string,
        role: string,
        organizationId: string
    }

}