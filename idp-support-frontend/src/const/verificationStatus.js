export const VerificationStatus = {
    APPROVED: 'Approved',
    PENDING: 'Pending',
    REJECTED: 'Rejected'
};

export const verificationStatusMapper = {
    [VerificationStatus.APPROVED]: 'Схвалено',
    [VerificationStatus.PENDING]: 'Очікує',
    [VerificationStatus.REJECTED]: 'Відхилено'
};
