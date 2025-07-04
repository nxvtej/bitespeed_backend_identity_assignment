export interface contact {
    id: Number;
    phoneNumber: string | null;
    email: string | null;
    linkedId: Number;
    linkPrecedence: 'primary' | 'secondary';
    createdAt: Date;
    updatedAt: Date;
    isDeleted: Boolean;
    deletedAt: Date | null;
}

export interface contactRequest {
    email: string | null;
    phoneNumber: string | null;
}

export interface contactResponse {
    contact: {
        primaryContactId: number;
        emails: string[];
        phoneNumbers: string[];
        secondaryContactIds: number[];
    }
}