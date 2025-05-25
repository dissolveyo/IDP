export const getVerificationStatusColor = (status) => {
    switch (status) {
        case 'Pending':
            return 'gold';
        case 'Approved':
            return 'green';
        case 'Rejected':
            return 'red';
        default:
            return 'default';
    }
};

export const getListingStatusColor = (status) => {
    switch (status) {
        case 'Active':
            return 'green';
        case 'Inactive':
            return 'orange';
        case 'Suspended':
            return 'grey';
        case 'Deleted':
            return 'deleted';
    }
};
