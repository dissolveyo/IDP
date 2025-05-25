export const ROLES = {
    LANDLORD: 'Landlord',
    IDP: 'IDP',
    SUPER_USER: 'SuperUser',
    MODERATOR: 'Moderator'
};

export const userRoleMapper = {
    [ROLES.IDP]: 'ВПО',
    [ROLES.LANDLORD]: 'Орендодавець',
    [ROLES.SUPER_USER]: 'Адміністратор',
    [ROLES.MODERATOR]: 'Модератор'
};
