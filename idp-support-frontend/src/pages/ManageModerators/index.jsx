import { Table, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { routes } from '@router/routes';
import { useToggle } from '@uidotdev/usehooks';
import { UserService } from '@services/UserService';
import { toast } from 'react-toastify';
import { getColumns } from './columns';

const { Title } = Typography;

export const ManageModerators = () => {
    const [moderators, setModerators] = useState([]);
    const [loading, toggleLoading] = useToggle();
    const [deleting, toggleDeleting] = useToggle(false);

    const getModerators = () => {
        toggleLoading();
        UserService.getModeratos()
            .then((moderators) => setModerators(moderators))
            .catch((e) => {
                if (e?.message) {
                    toast(e?.message, { type: 'error' });
                }
            })
            .finally(toggleLoading);
    };

    useEffect(() => {
        getModerators();
    }, []);

    const navigate = useNavigate();

    const handleDelete = (id) => {
        toggleDeleting();
        UserService.deleteModeratorById(id)
            .then(() => {
                toast('Модератора було успішно видалено', { type: 'success' });
                getModerators();
            })
            .catch(() => toast('Виникла помилка при видаленні модератора', { type: 'error' }))
            .finally(toggleDeleting);
    };

    const handleEdit = (id) => {
        navigate(routes.MANAGE_MODERATOR.replace(':id', id));
    };

    const columns = useMemo(
        () =>
            getColumns({
                moderators,
                deleting,
                onAdd: () => navigate(routes.CREATE_MODERATOR),
                onDelete: handleDelete,
                onEdit: handleEdit
            }),
        [moderators]
    );

    return (
        <div>
            <Title level={3}>Модератори</Title>
            <Table
                loading={loading}
                columns={columns}
                dataSource={moderators}
                pagination={{ pageSize: 5 }}
                bordered
                rowKey="key"
            />
        </div>
    );
};
