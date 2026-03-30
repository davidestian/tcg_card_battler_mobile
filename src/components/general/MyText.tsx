import { gs } from '@/src/styles/globalStyles';
import React from 'react';
import { Text, TextProps } from 'react-native';

// Extend the standard TextProps to keep all built-in functionality
interface MyTextProps extends TextProps {
    children?: React.ReactNode;
}

export const MyText: React.FC<MyTextProps> = ({ style, children, ...props }) => {
    return (
        <Text
            {...props}
            style={[gs.fontM, style]}>
            {children}
        </Text>
    );
};
