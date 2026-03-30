
import { Directory, File, Paths } from 'expo-file-system';
import { BASE_URI } from '../config';
import { ElementColor } from '../enums/colorEnum';
import { ElementEnum } from '../enums/generalEnum';

export const getUnitCardImagePath = async (origin: string, code: string, type: number): Promise<string> => {
    const filename = `${String(type).padStart(2, '0')}.webp`;
    const folderPath = `asset/images/units/${origin}/${code}/`;
    const fileUri = `${folderPath}${filename}`;

    try {
        // 1. Define folder and file objects
        const unitsDir = new Directory(Paths.document, folderPath);
        const unitFile = new File(unitsDir, filename);

        // 2. Check if file exists; if so, return its URI
        if (unitFile.exists) {
            return unitFile.uri;
        }

        // 3. Ensure the folder exists
        if (!unitsDir.exists) {
            unitsDir.create({ intermediates: true });
        }

        // 4. Download directly from API to the file object
        // This method handles the network request and writing to disk
        try {
            const downloadedFile = await File.downloadFileAsync(`${BASE_URI}/${fileUri}`, unitFile);
            return downloadedFile.uri;
        } catch (error: unknown) {
            // 2. Specific Error Catching
            if (error instanceof Error) {
                if (error.message.includes("already exists")) {
                    return unitFile.uri;
                } else {
                    console.error("Error saving image:", error);
                    throw error;
                }
            } else {
                console.error("Error saving image:", error);
                throw error;
            }
        }
    }
    catch (error) {
        console.error("Error saving image:", error);
        throw error;
    }
}

export const getRandomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const getElementColor = (element: ElementEnum): string => {
    let rs = 'transparent';
    switch (element) {
        case ElementEnum.Bug:
            rs = ElementColor.Bug;
            break;
        case ElementEnum.Dark:
            rs = ElementColor.Dark;
            break;
        case ElementEnum.Dragon:
            rs = ElementColor.Dragon;
            break;
        case ElementEnum.Electric:
            rs = ElementColor.Electric;
            break;
        case ElementEnum.Fairy:
            rs = ElementColor.Fairy;
            break;
        case ElementEnum.Fighting:
            rs = ElementColor.Fighting;
            break;
        case ElementEnum.Fire:
            rs = ElementColor.Fire;
            break;
        case ElementEnum.Flying:
            rs = ElementColor.Flying;
            break;
        case ElementEnum.Ghost:
            rs = ElementColor.Ghost;
            break;
        case ElementEnum.Grass:
            rs = ElementColor.Grass;
            break;
        case ElementEnum.Ground:
            rs = ElementColor.Ground;
            break;
        case ElementEnum.Ice:
            rs = ElementColor.Ice;
            break;
        case ElementEnum.Poison:
            rs = ElementColor.Poison;
            break;
        case ElementEnum.Normal:
            rs = ElementColor.Normal;
            break;
        case ElementEnum.Psychic:
            rs = ElementColor.Psychic;
            break;
        case ElementEnum.Rock:
            rs = ElementColor.Rock;
            break;
        case ElementEnum.Steel:
            rs = ElementColor.Steel;
            break;
        case ElementEnum.Water:
            rs = ElementColor.Water;
            break;
    }

    return rs;
}
