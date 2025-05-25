export const ComplaintReasons = {
    comment: [
        { value: 'inappropriate_language', label: 'Неприйнятна мова' },
        { value: 'spam_comment', label: 'Спам' },
        { value: 'false_information', label: 'Неправдива інформація' },
        { value: 'harassment', label: 'Цькування' },
        { value: 'off_topic', label: 'Не по темі' }
    ],
    listing: [
        { value: 'duplicate_listing', label: 'Скопійоване оголошення' },
        { value: 'fraudulent_listing', label: 'Фейкове оголошення' },
        { value: 'outdated_information', label: 'Застаріла інформація' },
        { value: 'incorrect_location', label: 'Неправильна локація' },
        { value: 'inappropriate_content', label: 'Неприйнятний вміст' }
    ],
    chat: [
        { value: 'harassment_chat', label: 'Переслідування в чаті' },
        { value: 'scam_attempt', label: 'Шахрайство' },
        { value: 'offensive_language', label: 'Образлива мова' },
        { value: 'irrelevant_messages', label: 'Спам / не по темі' },
        { value: 'unwanted_contact', label: 'Небажаний контакт' }
    ]
};
