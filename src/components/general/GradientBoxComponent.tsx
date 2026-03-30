import { ElementEnum } from '@/src/enums/generalEnum';
import { getElementColor } from '@/src/services/generalService';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ViewProps } from 'react-native-svg/lib/typescript/fabric/utils';

interface GBoxProps extends ViewProps {
    children?: React.ReactNode;
    elements: ElementEnum[];
}

export const GBox: React.FC<GBoxProps> = ({ style, elements, children, ...props }) => {
    const c1 = getElementColor(elements[0]);
    const c2 = elements.length > 1 ? getElementColor(elements[1]) : c1;
    return (
        <LinearGradient
            {...props}
            style={[style]}
            colors={[c1, c2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            locations={[0.5, 0.5]}>
            {children}
        </LinearGradient>
    );
};
