import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

export const scaleMin = (size: number) => {
    const widthRatio = width / guidelineBaseWidth;
    const heightRatio = height / guidelineBaseHeight;

    return size * Math.min(widthRatio, heightRatio);
};

export const fonts = scaleMin(8);
export const fontM = scaleMin(12);
export const fontL = scaleMin(18);
