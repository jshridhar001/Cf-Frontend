export type AddressPlace = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type AddressState = AddressPlace;

export type AddressDistrict = AddressPlace & {
  stateId: string;
  state?: AddressPlace;
};

export type AddressPostOffice = AddressPlace & {
  pincode: string;
  districtId: string;
  district?: AddressPlace & { stateId?: string };
};

export type AddressPoliceStation = AddressPlace & {
  postOfficeId: string;
  postOffice?: AddressPlace & { districtId?: string; pincode?: string };
};

export type AddressVillage = AddressPlace & {
  policeStationId: string;
  policeStation?: AddressPlace & { postOfficeId?: string };
};

export type AddressArea = AddressPlace & {
  villageId: string;
  village?: AddressPlace & {
    policeStationId?: string;
    policeStation?: AddressPlace & {
      postOfficeId?: string;
      postOffice?: AddressPlace & {
        pincode?: string;
        districtId?: string;
        district?: AddressPlace & {
          stateId?: string;
          state?: AddressPlace;
        };
      };
    };
  };
};

export type AddressEntity =
  | AddressState
  | AddressDistrict
  | AddressPostOffice
  | AddressPoliceStation
  | AddressVillage
  | AddressArea;

export type AddressListResponse<T> = {
  success: boolean;
  data: T[];
};

export type AddressItemResponse<T> = {
  success: boolean;
  data: T;
};

export type AddressMessageResponse = {
  success: boolean;
  message: string;
};
