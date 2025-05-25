import { periodMapper } from '@const/periodMapper';
import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
} from 'chart.js';
import { Typography } from 'antd';

const { Title } = Typography;

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const periodColors = {
    '1_week': 'rgba(255, 99, 132, 0.7)',
    '2_weeks': 'rgba(54, 162, 235, 0.7)',
    '1_month': 'rgba(255, 206, 86, 0.7)',
    '3_months': 'rgba(75, 192, 192, 0.7)',
    '6_months': 'rgba(153, 102, 255, 0.7)',
    '1_year': 'rgba(255, 159, 64, 0.7)',
    '2_years': 'rgba(199, 199, 199, 0.7)',
    unlimited: 'rgba(255, 99, 255, 0.7)'
};

export const LengthOfStayAnalytics = ({ data }) => {
    const lengthOfStay = useMemo(() => {
        const labels = Object.keys(periodMapper);

        const datasets = labels.map((label) => ({
            label: periodMapper[label],
            data: [data[label] || 0],
            backgroundColor: periodColors[label],
            borderRadius: 6
        }));

        return {
            labels: ['Тривалість проживання'],
            datasets
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
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.4rem' }}>Тривалість проживання</h2>
            <Bar
                data={lengthOfStay}
                options={{
                    responsive: true,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    const value = context.raw;
                                    return `${value} заявок`;
                                },
                                title: (context) => {
                                    return context[0]?.dataset?.label;
                                }
                            }
                        },
                        legend: {
                            position: 'top',
                            labels: {
                                font: {
                                    size: 14
                                }
                            }
                        },
                        title: {
                            display: true,
                            text: 'Розподіл тривалості проживання для підтверджених заявок',
                            font: {
                                size: 16
                            }
                        }
                    },

                    scales: {
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
