import { getRequisitionDistrictName, getRequisitionPlaceName, getRequisitionVillageName, } from '@/features/seed-requisition/overview/types';
const BLANK = '—';
function display(value) {
    if (value == null)
        return BLANK;
    const text = String(value).trim();
    return text || BLANK;
}
function firstPlace(...values) {
    for (const value of values) {
        const text = value?.trim();
        if (text)
            return text;
    }
    return '';
}
function getPoliceStation(farmer) {
    return firstPlace(getRequisitionPlaceName(farmer?.policeStation), farmer?.area?.policeStation?.name, farmer?.area?.village?.policeStation?.name);
}
function getPostOffice(farmer) {
    return firstPlace(getRequisitionPlaceName(farmer?.postOffice), farmer?.area?.postOffice?.name, farmer?.area?.village?.policeStation?.postOffice?.name);
}
function getState(farmer) {
    return firstPlace(getRequisitionPlaceName(farmer?.state), farmer?.area?.village?.policeStation?.postOffice?.district?.state?.name, farmer?.area?.state?.name);
}
function getPin(farmer) {
    return firstPlace(farmer?.pincode?.pincode, farmer?.pincode?.name);
}
function ordinalDay(day) {
    const mod100 = day % 100;
    if (mod100 >= 11 && mod100 <= 13)
        return `${day}th`;
    switch (day % 10) {
        case 1:
            return `${day}st`;
        case 2:
            return `${day}nd`;
        case 3:
            return `${day}rd`;
        default:
            return `${day}th`;
    }
}
export function toAgreementFields(requisition, language) {
    const farmer = requisition.farmer;
    const source = requisition.contractDate || requisition.requisitionDate;
    const date = source ? new Date(source) : null;
    const valid = date && !Number.isNaN(date.getTime()) ? date : null;
    const locale = language === 'hi' ? 'hi-IN' : 'en-IN';
    return {
        day: valid
            ? language === 'hi'
                ? String(valid.getDate())
                : ordinalDay(valid.getDate())
            : BLANK,
        month: valid ? new Intl.DateTimeFormat(locale, { month: 'long' }).format(valid) : BLANK,
        year: valid ? String(valid.getFullYear()) : BLANK,
        growerName: display(farmer?.name),
        fatherName: BLANK,
        pan: display(farmer?.panNumber),
        aadhaar: display(farmer?.aadharNumber),
        bankAccount: display(farmer?.bankAccountNumber),
        bankName: display(farmer?.bankName),
        branch: BLANK,
        ifsc: display(farmer?.ifscCode),
        village: display(getRequisitionVillageName(farmer)),
        policeStation: display(getPoliceStation(farmer)),
        postOffice: display(getPostOffice(farmer)),
        tehsil: BLANK,
        district: display(getRequisitionDistrictName(farmer)),
        state: display(getState(farmer)),
        pin: display(getPin(farmer)),
        acres: display(requisition.requestedAcres),
        landVillage: display(getRequisitionVillageName(farmer)),
    };
}
export function agreementFileName(growerName, language) {
    const slug = growerName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    return `potato-multiplication-agreement-${slug || 'grower'}-${language}.pdf`;
}
