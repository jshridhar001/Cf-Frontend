export const JALANDHAR_DELIVERY = 'गांव अलीपुर, पोस्ट ऑफिस मीठापुर, जालंधर, तहसील और जिला जालंधर (पंजाब) - 144022';
export const BAZPUR_DELIVERY = 'बज़पुर, उधम सिंह नगर, उत्तराखंड- 262401';
export function emphasizeFigure(amount, prefix = '') {
    const splitAt = amount.indexOf(' (');
    const figure = splitAt === -1 ? amount : amount.slice(0, splitAt);
    const words = splitAt === -1 ? '' : amount.slice(splitAt + 1);
    const marked = `**${prefix}${figure}**`;
    return words ? `${marked} ${words}` : marked;
}
export const CHEQUE_10000 = {
    en: 'Rs. 10,000/- (Rupees Ten Thousand only)',
    hi: '₹10,000/- (दस हजार रुपये)',
};
export const AMOUNT_19000 = {
    en: 'Rs. 19,000/- (Rupees Nineteen Thousand only)',
    hi: '₹19,000/- (उन्नीस हजार रुपये)',
};
export const AMOUNT_25000 = {
    en: 'Rs. 25,000/- (Rupees Twenty-Five Thousand only)',
    hi: '₹25,000/- (पच्चीस हजार रुपये)',
};
export const AMOUNT_30000 = {
    en: 'Rs. 30,000/- (Rupees Thirty Thousand only)',
    hi: '₹30,000/- (तीस हजार रुपये)',
};
export const AMOUNT_36000 = {
    en: 'Rs. 36,000/- (Rupees Thirty-Six Thousand only)',
    hi: '₹36,000/- (छत्तीस हजार रुपये)',
};
export const CONDITIONAL_ANNEXURE_INTRO = {
    en: 'Planting material to be supplied per acre by tuber size, as supplied to the Second Party for multiplication under Clause 1.1 of this Agreement. The Conditional Seed Value of Rs. 36,000/- per acre set out in Clause 1.6 applies irrespective of the grade mix actually supplied:',
    hi: 'इस एग्रीमेंट के क्लॉज 1.1 के हिसाब से, सेकंड पार्टी को मल्टीप्लीकेशन के लिए प्रति एकड़ दिया जाने वाला प्लांटिंग मटीरियल, ट्यूबर साइज़ के हिसाब से इस तरह है। क्लॉज 1.6 में तय ₹36,000/- प्रति एकड़ की कंडीशनल सीड वैल्यू, चाहे कोई भी ग्रेड मिक्स दिया जाए, वही लागू रहेगी:',
};
export const CONDITIONAL_ANNEXURE_NOTE = {
    en: 'The above table shows the standard quantity of planting material per acre for each tuber size/grade, along with the Conditional Rate per bag for that grade. The Conditional Rate is calculated by dividing the Conditional Seed Value of Rs. 36,000/- per acre (Clause 1.6) by the number of bags per acre applicable to that grade, and is shown for reference only — the amount actually payable by the Second Party remains the flat Conditional Seed Value of Rs. 36,000/- per acre irrespective of the grade mix supplied. The Second Party must sow the planting material supplied as per the quantities specified herein. If the quantity of planting material supplied changes after signing this Agreement, the area to be planted shall be adjusted in the same proportion as the change in quantity.',
    hi: 'ऊपर दी टेबल हर ट्यूबर साइज़/ग्रेड के लिए प्रति एकड़ प्लांटिंग मटीरियल की स्टैंडर्ड क्वांटिटी दिखाती है, साथ ही उस ग्रेड का कंडीशनल रेट (प्रति बोरी) भी दिखाती है। यह कंडीशनल रेट, क्लॉज 1.6 में तय ₹36,000/- प्रति एकड़ की कंडीशनल सीड वैल्यू को उस ग्रेड की प्रति एकड़ बोरी काउंट से डिवाइड करके निकाला गया है, और यह सिर्फ जानकारी के लिए है — सेकंड पार्टी को असल में जो अमाउंट देना होगा, वो हमेशा ₹36,000/- प्रति एकड़ की कंडीशनल सीड वैल्यू ही रहेगा, चाहे कोई भी ग्रेड मिक्स दिया जाए। सेकंड पार्टी को यहां बताई क्वांटिटी के हिसाब से ही प्लांटिंग मटीरियल बोना होगा। अगर इस एग्रीमेंट पर साइन के बाद दिए जाने वाले प्लांटिंग मटीरियल की क्वांटिटी में बदलाव होता है, तो बोई जाने वाली जमीन का एरिया भी उसी अनुपात में एडजस्ट किया जाएगा।',
};
export const CONDITIONAL_ANNEXURE_HEADERS = {
    en: [
        'Designated Grade',
        'Planting Material per Acre (units as 50 Kgs per bag)',
        'Conditional Rate (Rs. per Bag)',
    ],
    hi: ['ग्रेड (साइज़)', 'प्लांटिंग मटीरियल प्रति एकड़ (50 किलो की बोरी)', 'कंडीशनल रेट (₹ प्रति बोरी)'],
};
