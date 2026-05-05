import { fetcher } from "../fetcher";
import { Province, District, Ward } from "@/schemas/location";
import { ApiResponse } from "@/schemas/api";

export const locationApi = {
  getProvinces: async (): Promise<ApiResponse<Province[]>> => {
    return fetcher<ApiResponse<Province[]>>("/locations/provinces");
  },

  getDistricts: async (provinceCode: string): Promise<ApiResponse<District[]>> => {
    return fetcher<ApiResponse<District[]>>(`/locations/districts/${provinceCode}`);
  },

  getWards: async (districtCode: string): Promise<ApiResponse<Ward[]>> => {
    return fetcher<ApiResponse<Ward[]>>(`/locations/wards/${districtCode}`);
  },
};
