import { Image, ImageSourcePropType } from "react-native";

export const backCard: Record<string, ImageSourcePropType> = {
    ["001"]: require('../../assets/images/001-B.webp'),
};

export const getBackCardImage = (origin: string): string => {
    const img = backCard[origin];

    if (!img) return '';

    const imageAsset = Image.resolveAssetSource(img);
    return imageAsset!.uri;
};
