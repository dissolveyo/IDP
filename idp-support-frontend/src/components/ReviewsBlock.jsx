import React, { useEffect, useState } from 'react';
import {
    Button,
    Modal,
    Rate,
    Input,
    List,
    Avatar,
    Spin,
    Typography,
    Select,
    Tooltip,
    Popconfirm
} from 'antd';
import { UserOutlined, WarningOutlined } from '@ant-design/icons';
import NoReviews from './NoReviews';
import { baseURL } from '@api/index';
import { RatingService } from '@services/RatingService';
import { toast } from 'react-toastify';
import { useUserStore } from '@store/userStore';
import { ComplaintModal } from './ComplaintModal';
import { ComplaintService } from '@services/ComplaintService';
import { useLocation } from 'react-router';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const ReviewsBlock = ({ listing, ratings, loadingRatings, refetch, isAllowedToRate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [score, setScore] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const user = useUserStore((state) => state.user);

    const [editingRating, setEditingRating] = useState(null);
    const [editScore, setEditScore] = useState(0);
    const [editComment, setEditComment] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [scoreFilter, setScoreFilter] = useState(null);
    const [isComplaintModal, setIsComplaintModal] = useState(false);
    const [reportRating, setReportRating] = useState(null);
    const [complaintLoading, setComplaintLoading] = useState(false);
    const location = useLocation();
    const [highlightId, setHighlightId] = useState(null);

    const onEditRating = (rating) => {
        setEditingRating(rating);
        setEditScore(rating.score);
        setEditComment(rating.comment);
        setModalVisible(true);
    };
    const onDeleteRating = async (id) => {
        setLoading(true);
        RatingService.deleteRating(id)
            .then(() => {
                toast('Рейтинг було успішно видалено', { type: 'success' });
                refetch();
            })
            .catch(() => {
                toast('Виникла помилка при видаленні рейтингу', { type: 'error' });
            })
            .finally(() => setLoading(false));
    };

    const handleEditSave = () => {
        setLoading(true);
        RatingService.updateRating({ id: editingRating.id, score: editScore, comment: editComment })
            .then(() => {
                toast('Рейтинг було оновлено успішно', { type: 'success' });
                setEditScore(0);
                setEditComment('');
                setModalVisible(false);
                setEditingRating(null);
                refetch();
            })
            .catch(() => {
                toast('Виникла помилка при оновленні рейтингу', { type: 'error' });
            })
            .finally(() => setLoading(false));
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setComment('');
        setScore(0);
    };

    const handleSubmit = () => {
        setLoading(true);
        RatingService.createRating({ listingId: listing?._id, score, comment })
            .then(() => {
                toast('Коментар успішно створено', { type: 'success' });
                refetch();
                closeModal();
            })
            .catch(() => {
                toast('Виникла помилка під час створення коментаря', { type: 'error' });
            })
            .finally(() => setLoading(false));
    };

    const filteredRatings = ratings.filter((rating) => {
        const matchesText = rating.comment?.toLowerCase().includes(searchText.toLowerCase());

        const matchesScore = scoreFilter ? rating.score === scoreFilter : true;

        return matchesText && matchesScore;
    });

    useEffect(() => {
        const hash = location.hash;

        if (hash.startsWith('#comment-') && !!ratings) {
            const commentId = hash.replace('#comment-', '');
            setHighlightId(commentId);

            const element = document.querySelector(hash);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, [location, ratings]);

    const createComplaint = (values) => {
        setComplaintLoading(true);
        const ratingId = reportRating.id;
        const listingId = reportRating.listingId;
        const complainantId = user._id;

        ComplaintService.createComplaint({ ...values, ratingId, listingId, complainantId })
            .then(() => {
                toast('Ваша скарга успішно надіслана. Дякуємо, що покращуєте спільноту', {
                    type: 'success'
                });
                setReportRating(null);
                setIsComplaintModal(false);
            })
            .catch(() => {
                toast('Виникла помилка при надсиланні скарги', {
                    type: 'error'
                });
            })
            .finally(() => setComplaintLoading(false));
    };

    return (
        <div style={{ marginTop: 48, display: 'flex', gap: 24 }}>
            <div style={{ flex: 1 }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                    <div>
                        <Title level={4}>Відгуки</Title>

                        <div style={{ marginBottom: 12 }}>
                            <Rate allowHalf disabled defaultValue={listing.rating} />
                            <Text style={{ marginLeft: 8 }}>{listing.rating?.toFixed(1)} / 5</Text>
                        </div>
                    </div>

                    {isAllowedToRate && (
                        <Button type="primary" onClick={openModal}>
                            Залишити відгук
                        </Button>
                    )}
                </div>

                {!loadingRatings && ratings.length > 0 && (
                    <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                        <Input
                            placeholder="Пошук по коментарю"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: 300 }}
                            allowClear
                        />
                        <Select
                            placeholder="Оцінка"
                            value={scoreFilter}
                            onChange={setScoreFilter}
                            allowClear
                            style={{ width: 120 }}>
                            {[5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5].map((val) => (
                                <Select.Option key={val} value={val}>
                                    {val} ★
                                </Select.Option>
                            ))}
                        </Select>
                    </div>
                )}

                {loadingRatings ? (
                    <Spin />
                ) : filteredRatings.length > 0 ? (
                    <List
                        dataSource={filteredRatings}
                        renderItem={(rating) => (
                            <List.Item
                                id={`comment-${rating.id}`}
                                key={rating.id || rating.createdAt}
                                style={{
                                    backgroundColor:
                                        highlightId === rating.id ? '#fffbe6' : 'transparent'
                                }}
                                actions={[
                                    rating?.user?.id === user?._id && (
                                        <>
                                            <Button
                                                type="link"
                                                onClick={() => onEditRating(rating)}>
                                                Редагувати
                                            </Button>
                                            <Popconfirm
                                                title="Ви впевнені, що хочете видалити цей коментар?"
                                                okText="Так"
                                                cancelText="Скасувати"
                                                onConfirm={() => onDeleteRating(rating.id)}>
                                                <Button type="link" danger>
                                                    Видалити
                                                </Button>
                                            </Popconfirm>
                                        </>
                                    ),
                                    user?.role === 'Moderator' && (
                                        <Popconfirm
                                            title="Ви впевнені, що хочете видалити цей коментар?"
                                            okText="Так"
                                            cancelText="Скасувати"
                                            onConfirm={() => onDeleteRating(rating.id)}>
                                            <Button type="link" danger>
                                                Видалити
                                            </Button>
                                        </Popconfirm>
                                    ),
                                    rating?.user?.id !== user?._id &&
                                        ['Landlord', 'IDP'].includes(user?.role) && (
                                            <Tooltip title="Поскаржитись">
                                                <Button
                                                    type="text"
                                                    icon={<WarningOutlined />}
                                                    onClick={() => {
                                                        setReportRating(rating);
                                                        setIsComplaintModal(true);
                                                    }}
                                                />
                                            </Tooltip>
                                        )
                                ].filter(Boolean)}>
                                <List.Item.Meta
                                    avatar={
                                        <Avatar
                                            src={
                                                rating.user?.avatar &&
                                                `${baseURL}${rating.user?.avatar}`
                                            }
                                            icon={!rating.user?.avatar && <UserOutlined />}
                                        />
                                    }
                                    title={`${rating.user?.firstName} ${rating.user?.lastName}`}
                                    description={
                                        <>
                                            <Rate disabled allowHalf value={rating.score} />
                                            <div style={{ marginTop: 4 }}>{rating.comment}</div>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                {new Date(rating.createdAt).toLocaleDateString()}
                                            </Text>
                                        </>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                ) : (
                    <NoReviews />
                )}
            </div>
            <Modal
                title="Залишити відгук"
                open={isModalOpen}
                onCancel={closeModal}
                loading={loading}
                onOk={handleSubmit}
                cancelText="Закрити"
                okText="Відправити"
                okButtonProps={{
                    disabled: score === 0 || comment.trim() === ''
                }}>
                <Rate allowHalf onChange={setScore} value={score} style={{ marginBottom: 16 }} />
                <TextArea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Ваш коментар"
                />
            </Modal>
            <Modal
                title="Редагувати відгук"
                open={modalVisible}
                cancelText="Закрити"
                okText="Відправити"
                loading={loading}
                onOk={handleEditSave}
                onCancel={() => setModalVisible(false)}>
                <Rate allowHalf value={editScore} onChange={(value) => setEditScore(value)} />
                <Input.TextArea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    rows={4}
                    style={{ marginTop: 16 }}
                />
            </Modal>

            {isComplaintModal && (
                <ComplaintModal
                    open={isComplaintModal}
                    type="comment"
                    loading={complaintLoading}
                    onCancel={() => {
                        setIsComplaintModal(false);
                        setReportRating(null);
                    }}
                    onSubmit={(values) => createComplaint(values)}
                />
            )}
        </div>
    );
};
