import React, { useMemo } from 'react';
import { PolarArea } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, ArcElement, Tooltip, Legend, Title } from 'chart.js';

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend, Title);

export const RelocateRegionsAnalytics = ({ data }) => {
    const chartData = useMemo(() => {
        if (!data || !data.length) return null;

        return {
            labels: data.map((d) => d.region),
            datasets: [
                {
                    label: 'Кількість переселень',
                    data: data.map((d) => d.amount),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)'
                    ],
                    borderWidth: 1
                }
            ]
        };
    }, [data]);

    if (!chartData)
        return <div style={{ textAlign: 'center', paddingTop: '4rem' }}>Дані відсутні.</div>;

    return (
        <div
            style={{
                width: '100%',
                margin: '0 auto',
                background: '#fff',
                padding: '2rem',
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.4rem' }}>
                Найбільш популярні області для переселення
            </h2>
            <div style={{ maxHeight: '500px', display: 'flex', justifyContent: 'center' }}>
                <PolarArea
                    data={chartData}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top'
                            },
                            title: {
                                display: true,
                                text: '5 найбільш популярних областей за кількістю переселень',
                                font: {
                                    size: 16
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    label: (ctx) => {
                                        return `${ctx.raw} завявок`;
                                    }
                                }
                            }
                        },
                        scales: {
                            r: {
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 5
                                }
                            }
                        }
                    }}
                />
            </div>
        </div>
    );
};
