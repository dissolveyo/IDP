export const UserStatus = {
    ACTIVE: 'Active',
    UNVERIFIED: 'Unverified',
    SUSPENDED: 'Suspended',
    DELETED: 'Deleted'
};

export const userStatusMapper = {
    [UserStatus.ACTIVE]: 'Активний',
    [UserStatus.UNVERIFIED]: 'Не верифікований',
    [UserStatus.SUSPENDED]: 'Деактивований',
    [UserStatus.DELETED]: 'Видалений'
};
