import React, { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export const InfrastructureLoadAnalytics = ({ data }) => {
    const formattedData = useMemo(() => {
        if (!data || !data.length) return null;

        const sortedData = [...data].sort((a, b) => a.region.localeCompare(b.region, 'uk'));

        const labels = sortedData.map((item) => item.region);
        const values = sortedData.map((item) => item.amountOfPeople);

        const backgroundColors = [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
            '#C9CBCF',
            '#66DDAA',
            '#FFA07A',
            '#00CED1',
            '#BA55D3',
            '#E9967A',
            '#8FBC8F',
            '#FFD700',
            '#87CEFA',
            '#CD5C5C'
        ];

        return {
            labels,
            datasets: [
                {
                    data: values,
                    backgroundColor: backgroundColors.slice(0, labels.length),
                    borderColor: '#ffffff',
                    borderWidth: 1
                }
            ]
        };
    }, [data]);

    if (!formattedData)
        return <div style={{ textAlign: 'center', paddingTop: '4rem' }}>Дані відсутні.</div>;

    const totalPeople = data.reduce((acc, item) => acc + item.amountOfPeople, 0);

    return (
        <div
            style={{
                width: '100%',
                margin: '0 auto',
                background: '#ffffff',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.4rem' }}>
                Навантаження на інфраструктуру
            </h2>
            <div style={{ marginBottom: '1rem' }}>
                За цей місяць <strong>{totalPeople}</strong> людей переселено в різні області.
            </div>
            <div style={{ maxHeight: '500px', display: 'flex', justifyContent: 'center' }}>
                <Pie
                    data={formattedData}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    boxWidth: 14,
                                    font: {
                                        size: 12
                                    }
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    label: (context) => {
                                        const value = context.raw;
                                        return `${value} людей`;
                                    }
                                }
                            },
                            title: {
                                display: true,
                                text: 'Розподіл переселених людей по регіонах',
                                font: {
                                    size: 16
                                }
                            }
                        }
                    }}
                />
            </div>
        </div>
    );
};
