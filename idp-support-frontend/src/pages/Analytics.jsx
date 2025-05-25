import React, { useEffect, useState } from 'react';

import { AnalyticsService } from '@services/AnalyticsService';
import { Typography } from 'antd';
import { HouseDemandAnalytics } from '@components/HouseDemandAnalytics';
import { LengthOfStayAnalytics } from '@components/LengthOfStayAnalytics';
import { RelocateRegionsAnalytics } from '@components/RelocateRegionsAnalytics';
import { FraudFrequencyAnalytics } from '@components/FraudFrequencyAnalytics';
import { InfrastructureLoadAnalytics } from '@components/InfrastructureLoadAnalytics';

const { Title } = Typography;

export const Analytics = () => {
    const [lengthOfStay, setLengthOfStay] = useState(null);
    const [houseDemand, setHouseDemand] = useState(null);
    const [relocateRegions, setRelocateRegions] = useState(null);
    const [fraudFrequency, setFraudFrequency] = useState(null);
    const [infrastructureLoad, setInfrastructureLoad] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAnalytics() {
            try {
                const response = await AnalyticsService.getAnalyticsByType('length_of_stay');
                const houseDemand = await AnalyticsService.getAnalyticsByType('house_demand');
                const relocateRegions = await AnalyticsService.getAnalyticsByType(
                    'relocate_regions'
                );

                const fraudFrequency = await AnalyticsService.getAnalyticsByType('fraud_frequency');
                const infrastructureLoad = await AnalyticsService.getAnalyticsByType(
                    'infrastructure_load'
                );

                setInfrastructureLoad(infrastructureLoad.data);
                setFraudFrequency(fraudFrequency.data);

                setRelocateRegions(relocateRegions.data);

                setHouseDemand(houseDemand.data);

                setLengthOfStay(response.data.data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchAnalytics();
    }, []);

    if (loading)
        return (
            <div style={{ textAlign: 'center', paddingTop: '4rem' }}>Завантаження аналітики...</div>
        );
    if (!lengthOfStay)
        return <div style={{ textAlign: 'center', paddingTop: '4rem' }}>Дані відсутні.</div>;

    return (
        <div
            style={{
                background: 'linear-gradient(to bottom right, #f0f4f8, #d9e2ec)'
            }}>
            <Title level={3} style={{ marginBottom: '16px' }}>
                Аналітика
            </Title>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <LengthOfStayAnalytics data={lengthOfStay} />

                <HouseDemandAnalytics
                    data={houseDemand.data?.data}
                    total={houseDemand?.data?.total}
                />

                <RelocateRegionsAnalytics data={relocateRegions?.data} />

                <FraudFrequencyAnalytics data={fraudFrequency.data} />

                <InfrastructureLoadAnalytics data={infrastructureLoad.data} />
            </div>
        </div>
    );
};
