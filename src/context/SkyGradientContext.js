import React, { createContext, useContext, useState, useEffect } from 'react';

const SkyGradientContext = createContext(null);

// Default sky gradient parameters
const defaultSkyGradientParams = {
    solarAltitudeDeg: 0, // 0 = sunset/sunrise (horizon), -6 to 0 = twilight range
    highCloudCoverage: 0.7,
    aerosolConcentration: 0.2,
    relativeHumidity: 0.4,
    isAfterRain: true,
    hasVolcanicAerosol: true,
};

export const SkyGradientProvider = ({ children }) => {
    const [timeOverride, setTimeOverride] = useState(null);
    const [skyGradientParams, setSkyGradientParams] = useState(defaultSkyGradientParams);

    // Initialize with default params on mount
    useEffect(() => {
        // This ensures components get default params on initial render
    }, []);

    const updateTimeOverride = (override) => {
        setTimeOverride(override);
    };

    const updateSkyGradientParams = (params) => {
        setSkyGradientParams(params);
    };

    const value = {
        timeOverride,
        skyGradientParams,
        setTimeOverride: updateTimeOverride,
        setSkyGradientParams: updateSkyGradientParams,
    };

    return (
        <SkyGradientContext.Provider value={value}>
            {children}
        </SkyGradientContext.Provider>
    );
};

export const useSkyGradient = () => {
    const context = useContext(SkyGradientContext);
    if (!context) {
        // Return default values if context is not available (for components outside provider)
        return {
            timeOverride: null,
            skyGradientParams: defaultSkyGradientParams,
            setTimeOverride: () => { },
            setSkyGradientParams: () => { },
        };
    }
    return context;
};

export default SkyGradientContext;

