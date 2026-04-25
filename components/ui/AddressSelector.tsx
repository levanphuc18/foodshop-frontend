"use client";

import React, { useEffect, useState } from "react";
import { locationApi } from "../../lib/api/location";
import { Province, District, Ward } from "../../types/location";

interface AddressSelectorProps {
  onAddressChange: (data: {
    province?: Province;
    district?: District;
    ward?: Ward;
    fullAddress: string;
  }) => void;
  className?: string;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({ onAddressChange, className = "" }) => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");

  const [loading, setLoading] = useState({
    provinces: false,
    districts: false,
    wards: false,
  });

  // Fetch provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoading((prev) => ({ ...prev, provinces: true }));
      try {
        const response = await locationApi.getProvinces();
        if (response.code === 0) {
          setProvinces(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch provinces", error);
      } finally {
        setLoading((prev) => ({ ...prev, provinces: false }));
      }
    };
    fetchProvinces();
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    if (!selectedProvince) {
      setDistricts([]);
      return;
    }
    const fetchDistricts = async () => {
      setLoading((prev) => ({ ...prev, districts: true }));
      try {
        const response = await locationApi.getDistricts(selectedProvince);
        if (response.code === 0) {
          setDistricts(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch districts", error);
      } finally {
        setLoading((prev) => ({ ...prev, districts: false }));
      }
    };
    fetchDistricts();
    setSelectedDistrict("");
    setSelectedWard("");
    setWards([]);
  }, [selectedProvince]);

  // Fetch wards when district changes
  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      return;
    }
    const fetchWards = async () => {
      setLoading((prev) => ({ ...prev, wards: true }));
      try {
        const response = await locationApi.getWards(selectedDistrict);
        if (response.code === 0) {
          setWards(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch wards", error);
      } finally {
        setLoading((prev) => ({ ...prev, wards: false }));
      }
    };
    fetchWards();
    setSelectedWard("");
  }, [selectedDistrict]);

  // Notify parent when selection changes
  useEffect(() => {
    const province = provinces.find((p) => p.code === selectedProvince);
    const district = districts.find((d) => d.code === selectedDistrict);
    const ward = wards.find((w) => w.code === selectedWard);

    const parts = [ward?.fullName, district?.fullName, province?.fullName].filter(Boolean);
    
    onAddressChange({
      province,
      district,
      ward,
      fullAddress: parts.join(", "),
    });
  }, [selectedProvince, selectedDistrict, selectedWard, provinces, districts, wards]);

  const selectClassName = `w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed`;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {/* Province */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 ml-1">
          Tỉnh / Thành Phố
        </label>
        <div className="relative">
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className={selectClassName}
            disabled={loading.provinces}
          >
            <option value="">Chọn Tỉnh/Thành</option>
            {provinces.map((p) => (
              <option key={p.code} value={p.code}>
                {p.fullName}
              </option>
            ))}
          </select>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none text-[20px]">
            expand_more
          </span>
        </div>
      </div>

      {/* District */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 ml-1">
          Quận / Huyện
        </label>
        <div className="relative">
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className={selectClassName}
            disabled={!selectedProvince || loading.districts}
          >
            <option value="">Chọn Quận/Huyện</option>
            {districts.map((d) => (
              <option key={d.code} value={d.code}>
                {d.fullName}
              </option>
            ))}
          </select>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none text-[20px]">
            expand_more
          </span>
        </div>
      </div>

      {/* Ward */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 ml-1">
          Phường / Xã
        </label>
        <div className="relative">
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className={selectClassName}
            disabled={!selectedDistrict || loading.wards}
          >
            <option value="">Chọn Phường/Xã</option>
            {wards.map((w) => (
              <option key={w.code} value={w.code}>
                {w.fullName}
              </option>
            ))}
          </select>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none text-[20px]">
            expand_more
          </span>
        </div>
      </div>
    </div>
  );
};

export default AddressSelector;
