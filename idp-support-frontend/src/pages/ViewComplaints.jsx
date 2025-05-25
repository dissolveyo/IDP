import { useEffect, useState } from 'react';
import { Input, Select, DatePicker, Empty, Spin } from 'antd';
import dayjs from 'dayjs';
import { ComplaintService } from '@services/ComplaintService';
import { ComplaintCard } from '@components/ComplaintCard';
import { toast } from 'react-toastify';

const { RangePicker } = DatePicker;

export const ViewComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [filteredComplaints, setFilteredComplaints] = useState([]);

    const [typeFilter, setTypeFilter] = useState(null);
    const [titleFilter, setTitleFilter] = useState('');
    const [dateRange, setDateRange] = useState(null);
    const [statusFilter, setStatusFilter] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getAllComplaints();
    }, []);

    const getAllComplaints = () => {
        setLoading(true);
        ComplaintService.getAllComplaints()
            .then(({ data }) => {
                setComplaints(data);
                setFilteredComplaints(data);
            })
            .catch(() => {
                toast('Виникла помилка під час завантаження скарг', { type: 'error' });
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        let filtered = [...complaints];

        if (typeFilter) {
            filtered = filtered.filter((c) => c.type === typeFilter);
        }

        if (titleFilter) {
            filtered = filtered.filter((c) =>
                c.title.toLowerCase().includes(titleFilter.toLowerCase())
            );
        }

        if (dateRange && dateRange.length === 2) {
            const [start, end] = dateRange;
            filtered = filtered.filter((c) => {
                const createdAt = dayjs(c.createdAt);
                return (
                    createdAt.isAfter(start.startOf('day')) && createdAt.isBefore(end.endOf('day'))
                );
            });
        }

        if (statusFilter) {
            filtered = filtered.filter((c) => c.status === statusFilter);
        }

        setFilteredComplaints(filtered);
    }, [typeFilter, titleFilter, dateRange, statusFilter, complaints]);

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    alignItems: 'center',
                    backgroundColor: '#ffffff',
                    padding: '1rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                }}>
                <Select
                    placeholder="Тип скарги"
                    allowClear
                    style={{ minWidth: 180, flex: '1 1 180px' }}
                    value={typeFilter}
                    onChange={setTypeFilter}
                    options={[
                        { label: 'Коментар', value: 'comment' },
                        { label: 'Оголошення', value: 'listing' },
                        { label: 'Чат', value: 'chat' }
                    ]}
                />

                <Input
                    placeholder="Пошук за заголовком"
                    value={titleFilter}
                    onChange={(e) => setTitleFilter(e.target.value)}
                    style={{ minWidth: 220, flex: '2 1 250px' }}
                />

                <RangePicker
                    style={{ minWidth: 250, flex: '2 1 300px' }}
                    value={dateRange}
                    onChange={setDateRange}
                />

                <Select
                    placeholder="Статус скарги"
                    allowClear
                    style={{ minWidth: 180, flex: '1 1 180px' }}
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={[
                        { label: 'Очікує', value: 'pending' },
                        { label: 'Вирішено', value: 'handled' },
                        { label: 'Відхилено', value: 'dismissed' }
                    ]}
                />
            </div>
            <Spin spinning={loading}>
                {filteredComplaints.length > 0 ? (
                    filteredComplaints.map((complaint) => (
                        <ComplaintCard
                            key={complaint._id}
                            refetch={getAllComplaints}
                            complaint={complaint}
                        />
                    ))
                ) : (
                    <Empty style={{ marginTop: '100px' }} description="Не знайдено скарг" />
                )}
            </Spin>
        </div>
    );
};
