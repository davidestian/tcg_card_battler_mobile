import api from "../privateAPI";

export const getAssetUnitImage = async (origin: string, unitCode: string, unitType: string): Promise<Blob> => {
    const response = await api.get<Blob>(`/asset/images/units/${origin}/${unitCode}/${unitType}.webp`);
    return response.data;
}