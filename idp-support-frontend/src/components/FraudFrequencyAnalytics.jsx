import React, { useMemo } from 'react';

import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

export const FraudFrequencyAnalytics = ({ data }) => {
    const formattedData = useMemo(() => {
        if (!data) return null;

        const sortedDates = Object.keys(data).sort();

        return {
            labels: sortedDates,
            datasets: [
                {
                    label: 'Оголошення',
                    data: sortedDates.map((date) => data[date].listing || 0),
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.3)',
                    tension: 0.3,
                    pointRadius: 3,
                    pointHoverRadius: 5
                },
                {
                    label: 'Чат',
                    data: sortedDates.map((date) => data[date].chat || 0),
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.3)',
                    tension: 0.3,
                    pointRadius: 3,
                    pointHoverRadius: 5
                },
                {
                    label: 'Коментар',
                    data: sortedDates.map((date) => data[date].comment || 0),
                    borderColor: 'rgba(255, 206, 86, 1)',
                    backgroundColor: 'rgba(255, 206, 86, 0.3)',
                    tension: 0.3,
                    pointRadius: 3,
                    pointHoverRadius: 5
                }
            ]
        };
    }, [data]);

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
                Динаміка кількості скарг на шахрайство
            </h2>
            <Line
                data={formattedData}
                options={{
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        },
                        title: {
                            display: true,
                            text: 'Кількість скарг за датами',
                            font: {
                                size: 16
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => `${context.dataset.label}: ${context.raw}`
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
