import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const HouseDemandAnalytics = ({ data, total }) => {
    const formattedData = useMemo(() => {
        if (!data) return null;

        const sortedDates = Object.keys(data).sort();
        const values = sortedDates.map((date) => data[date]);

        return {
            labels: sortedDates,
            datasets: [
                {
                    label: 'Кількість заявок',
                    data: values,
                    fill: false,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.3)',
                    tension: 0.3,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        };
    }, [data]);

    if (!formattedData)
        return <div style={{ textAlign: 'center', paddingTop: '4rem' }}>Дані відсутні.</div>;

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
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.4rem' }}>Попит на житло</h2>
            <div>
                За цей місяць було створено <strong>{total}</strong> заявки
            </div>
            <Line
                data={formattedData}
                options={{
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Кількість заявок по днях',
                            font: {
                                size: 16
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => `Заявки: ${context.raw}`
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: {
                                maxRotation: 90,
                                minRotation: 45,
                                autoSkip: true,
                                maxTicksLimit: 10
                            }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }}
            />
        </div>
    );
};
