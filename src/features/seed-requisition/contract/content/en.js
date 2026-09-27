import { emphasizeFigure } from './varieties/commercial';
import { CURING } from './varieties/curing';
const FIRST_PARTY_OFFICE = 'Village - Alipur, PO - Mithapur, P.S – Sadar, Jalandhar, Tehsil & District- Jalandhar (Punjab)-144022';
const BAZPUR = 'Bazpur, Udham Singh Nagar, Uttarakhand- 262401';
export function englishAgreement(fields, terms) {
    const variety = terms.label.en;
    return [
        { kind: 'year', text: fields.year },
        { kind: 'title', text: 'POTATO MULTIPLICATION AGREEMENT' },
        { kind: 'variety', text: `Variety: ${terms.titleLabel.en}` },
        {
            kind: 'p',
            text: `This agreement is made and entered into on this **${fields.day} day of ${fields.month} of ${fields.year}** between **BHATTI AGRITECH PVT. LTD.** with its office at ${FIRST_PARTY_OFFICE} (hereinafter called first party which term shall unless repugnant to the context shall include its successors in interest, nominees and assigns), of the **First Party**`,
        },
        { kind: 'p', text: 'AND', bold: true, align: 'center' },
        {
            kind: 'p',
            text: `**S./Sh. ${fields.growerName} S/O ${fields.fatherName}** holder of **PAN Card No. ${fields.pan}**, **Aadhar Card No. ${fields.aadhaar}** and Bank Account No. ${fields.bankAccount}, Bank ${fields.bankName} Branch ${fields.branch}, with its IFS Code ${fields.ifsc}, Resident of Village ${fields.village}, P.S - ${fields.policeStation}, PO - ${fields.postOffice}, Tehsil - ${fields.tehsil}, District - ${fields.district}, State - ${fields.state}, Pin Code - ${fields.pin} (Hereinafter called **second party** which term shall unless repugnant to the context shall include its successors in interest, nominees and assigns), of the Second Party, whereas`,
        },
        {
            kind: 'p',
            text: `1. **The Second party** is the **owner/ lessee of ${fields.acres} acre of land at Village ${fields.landVillage}** (Hereinafter called "the said land") and is desirous of undertaking the multiplication of potato under 'Potato Multiplication Agreement' on the said land.`,
        },
        {
            kind: 'p',
            text: `2. The **First party** is willing to provide **Potato variety ${variety}** to the **second party for multiplication on subsidized cost**, and to procure the output at a pre-determined price subject to terms and conditions laid out in the agreement.`,
        },
        {
            kind: 'p',
            text: '3. The potato is being supplied to the second party under this agreement for multiplication on the assurance, representation and warranty of the second party that neither the potato nor the potato output here from shall be used by the second party otherwise than in accordance with the terms and conditions herein.',
        },
        { kind: 'p', text: 'NOW THIS AGREEMENT WITNESSTH AS UNDER:', bold: true },
        { kind: 'h2', text: '1. SUPPLY OF MOTHER TUBER' },
        {
            kind: 'p',
            text: `1.1 The First Party shall supply the agreed variety ${variety}, treated Potato, to the Second Party for multiplication by planting in the said land. The Potato shall be supplied as planting material in the quantities, tuber sizes, and at the prices per acre set out in Annexure 1, which together constitute the Conditional Seed Value under this Potato Multiplication Agreement.`,
        },
        {
            kind: 'p',
            text: '1.2 First party shall deliver the mother tubers to the second party at a designated common place.',
        },
        {
            kind: 'p',
            text: '1.3 **Second party** shall pay to the First party a sum of **Rs. 1,000/-** (Rupees One Thousand only) per acre as token money against booking.',
        },
        {
            kind: 'p',
            text: `1.4 **Second party** shall pay to the First party in advance a sum of ${emphasizeFigure(terms.advanceAmount.en)} per acre before delivery of potato.`,
        },
        {
            kind: 'p',
            text: `1.5 The balance of the seed value shall be secured through two post-dated cheques (PDC) furnished by the Second Party — ${emphasizeFigure(terms.firstCheque.en, 'one for ')} and ${emphasizeFigure(terms.secondCheque.en, 'another for ')} — together constituting the balance *"Conditional Seed Value". These cheques shall be adjusted against the final seed cost determined under Clause 1.6 below, with any resulting balance refunded to the Second Party thereafter, and shall be encashed by the First Party only in the circumstances set out in Clause 7.1 (Termination), which shall prevail over this Clause 1 in the event of any conflict.`,
        },
        { kind: 'h3', text: `1.6 *"Conditional Seed Value" — ${variety}` },
        {
            kind: 'p',
            text: 'The final seed cost value shall be determined only at the time of procurement, based on the final yield recorded, as follows:',
        },
        {
            kind: 'p',
            text: `(a) Where the final yield is 80 to 100 Quintals per acre, the seed value shall be ${terms.normalYieldSeedValue.en} per acre, and the applicable buy-back rates specified in Clause 5 shall apply. This yield range represents the expected/average yield level under normal climatic conditions.`,
        },
        {
            kind: 'p',
            text: '(b) Where the final yield is below 80 Quintals per acre, the seed value shall be Rs. 55,000/- (Rupees Fifty-Five Thousand only) per acre, and the applicable buy-back rates shall be as specified in Clause 5. A yield below 80 Quintals per acre is considered substantially lower than the expected average yield, and accordingly, the seed value shall be adjusted as provided herein.',
        },
        {
            kind: 'p',
            text: '(c) Where the final yield exceeds 100 Quintals per acre, the seed value shall be Rs. 55,000/- (Rupees Fifty-Five Thousand only) per acre. The buy-back rates specified in Clause 5 shall not apply in this scenario, as a yield exceeding 100 Quintals per acre shall be considered indicative that the haulms were not cut or removed within the prescribed or appropriate time. Accordingly, the rates applicable under Clauses (a) and (b) shall not apply in this situation.',
        },
        { kind: 'h2', text: '2. COMMON SCAB TOLERANCE AND REJECTION CLAUSE' },
        {
            kind: 'p',
            text: 'The Parties hereby agree that the maximum allowable tolerance limit for tubers exhibiting visible symptoms caused by Common Scab shall be **0.1%** by **number**. The First Party reserves the right to reject the entire potato lot if the incidence of Common Scab exceeds the aforementioned limit. In the event of such rejection, the cost of the seed per acre shall be fixed at Rs 55,000 (Rupees Fifty-Five Thousand only), which shall be borne by the Second Party.',
        },
        { kind: 'h2', text: '3. MULTIPLICATION OF POTATO UNDER POTATO MULTIPLICATION AGREEMENT' },
        {
            kind: 'p',
            text: '3.1 Second party shall be responsible for all farming activities including land preparation, Irrigation, planting, plant protection measures and harvesting to produce quality potato output.',
        },
        {
            kind: 'p',
            text: '3.2 Second party shall be responsible for providing all the required inputs including water, chemicals, fertilizers, fungicides, insecticide and labour. Only the rogueing experts and their payment to be provided by first party.',
        },
        {
            kind: 'p',
            text: '3.3 Second party shall strictly follow Package of practices as prescribed by First party. Second party shall conduct the planting, rogueing, de-haulming and harvesting operations and the packing of the potato output in presence of the representative of first party or after receiving instructions from first party to start such operations.',
        },
        {
            kind: 'p',
            text: '3.4 The First Party shall conduct strip tests at two distinct crop stages in the presence of the Second Party: (a) **Pre-dehaulming**, to determine the appropriate dehaulming schedule; and (b) **Post-dehaulming**, to estimate the expected yield per acre.',
        },
        {
            kind: 'p',
            text: '3.5 The Second Party shall de-haulm the crop/vegetative parts strictly in accordance with the advisory issued by the First Party, and shall harvest the crop only after proper skin setting (curing) has been confirmed by the First Party.',
        },
        {
            kind: 'p',
            text: "3.6 The curing periods set out in Clause 4.6.1 are indicative only, based on typical de-haulming timelines, and may not reflect actual field or crop conditions. Where a field's actual condition does not align with this indicative schedule, the First Party's strip test results and field-specific advisory under Clause 3.5 shall govern the de-haulming and harvesting timeline for that field instead.",
        },
        {
            kind: 'p',
            text: '3.7 Second party shall keep the potato output of the first party in hygienic conditions and ensure their safe keeping.',
        },
        {
            kind: 'p',
            text: `3.8 Second party shall send the whole potato output to the first party latest by 15th March at first party's place situated at – ${BAZPUR}.`,
        },
        {
            kind: 'p',
            text: '3.9 First party reserves the right to supervise at all times the activities of Potato Multiplication Agreement being carried out by the second party and shall advise, training and consultancy including advice on use of insecticides/pesticides to the second party necessary for the multiplication of potato.',
        },
        {
            kind: 'p',
            text: `3.10 The first party shall grade and quality test the produce in the presence of second party's representative if so desired by the second party at first party's place situated at – ${BAZPUR}.`,
        },
        {
            kind: 'p',
            text: '3.11 First party shall pay for Bardana used for potato output in accordance with quality and market price to the second party.',
        },
        {
            kind: 'p',
            text: '3.12 First party shall bear transportation charges for the potato output from production site to its own above said place.',
        },
        { kind: 'h2', text: '4. FARMER FIELD GUIDELINES AND AGRONOMIC PROTOCOLS' },
        {
            kind: 'p',
            text: 'The Second Party shall strictly adhere to the following field guidelines and agronomic protocols as a condition of this agreement. Non-compliance with any of the provisions below may be treated as a breach of this agreement.',
        },
        { kind: 'h3', text: '4.1 Seed Purity and Field Exclusivity' },
        {
            kind: 'p',
            text: '4.1.1 The Second Party shall not plant their own seeds or any seeds sourced independently in the same field where tubers supplied by Bhatti Agritech Pvt. Ltd. are planted.',
        },
        {
            kind: 'p',
            text: '4.1.2 One contractual field shall be planted with only one variety as supplied by the First Party. Mixing of varieties within a single field is strictly prohibited.',
        },
        {
            kind: 'p',
            text: '4.1.3 Under exceptional, and mutually agreed, circumstances where a different variety or independently sourced seeds are planted in the same field, the Second Party must ensure clear and visible physical demarcation separating the two plots. Such exceptional cases must be reported to and approved by the First Party in advance.',
        },
        { kind: 'h3', text: '4.2 Irrigation and Field Boundary Management' },
        {
            kind: 'p',
            text: '4.2.1 The Second Party shall ensure that irrigation water from neighbouring fields does not enter the contractual field at any point during the crop cycle. Adequate bunding or other field boundary measures shall be put in place to prevent cross-field water ingress.',
        },
        { kind: 'h3', text: '4.3 Planting and De-haulming Schedule' },
        {
            kind: 'p',
            text: '4.3.1 Planting in all contractual fields shall be completed latest by 20th November of the crop season.',
        },
        {
            kind: 'p',
            text: '4.3.2 De-haulming of the crop shall be completed latest by 10th February. The exact de-haulming date for each field shall be guided by the strip test results (see clause 4.5 below).',
        },
        {
            kind: 'p',
            text: '4.3.3 De-haulming shall be carried out exclusively by manual or mechanical means (machine cutting/flailing). The use of chemical desiccants, herbicides, or any weedicide spray to destroy or desiccate the haulm/vegetative parts is strictly prohibited. Any field found to have undergone chemical desiccation shall be treated as non-compliant and may result in rejection of the produce and/or termination of this agreement as per clause 7.',
        },
        { kind: 'h3', text: '4.4 Common Scab — Field Selection' },
        {
            kind: 'p',
            text: 'Planting shall be avoided in fields where incidence of Common Scab was recorded in the previous cropping season. The Second Party shall disclose the field history to the First Party before finalisation of the field for the contract.',
        },
        { kind: 'h3', text: '4.5 Strip Test for De-haulming Recommendation' },
        {
            kind: 'p',
            text: "Strip tests shall be conducted in every contractual farmer field between 58 and 65 days after the date of planting. The First Party's representative shall carry out the strip test and recommend the de-haulming date based on the results.",
        },
        { kind: 'h3', text: '4.6 Curing Period After De-haulming' },
        {
            kind: 'p',
            text: 'Based on the de-haulming window, the following minimum curing periods shall be observed before harvesting* :',
        },
        { kind: 'p', text: '(*to be read along with clauses 3.5 and 3.6)' },
        { kind: 'table', table: CURING.en },
        { kind: 'h3', text: '4.7 Roguing' },
        {
            kind: 'p',
            text: 'Roguing shall be carried out in every contractual field between 35 and 45 days after the date of planting. Rogueing experts shall be provided by the First Party as per clause 3.2. The Second Party shall facilitate access to the field and cooperate with the rogueing team during this window.',
        },
        { kind: 'h2', text: '5. BUY BACK PRICE' },
        { kind: 'table', table: terms.buyback.en },
        { kind: 'h2', text: '6. GENERAL' },
        {
            kind: 'p',
            text: '6.1 Second party shall be responsible for all taxes, levies etc. in respect of the land where the potatoes are grown by the second party.',
        },
        {
            kind: 'p',
            text: '6.2 Second party represents and warrants that it shall not, during the subsistence of this agreement:',
        },
        {
            kind: 'p',
            text: "(a) Sell or dispose of the first party's potato output under the Potato Multiplication Agreement to any persons or entity other than to first party and party designated, in writing by first party; or",
        },
        {
            kind: 'p',
            text: "(b) Use the first party's potato for any purpose, other than potato multiplication under the terms of this agreement.",
        },
        {
            kind: 'p',
            text: '6.3 Second party shall be responsible for procurement, guidance and supervision of all labour utilized in carrying out of the Potato Multiplication Agreement operations. The said labour shall at no time be deemed/ represented to be employees of first party. Second party shall be fully responsible for all actions of its workforce and deal with any suits/legal actions, which may arise in connection with them and keep first party indemnified in this regard.',
        },
        {
            kind: 'p',
            text: '6.4 This agreement contains the agreement of the parties with respect to the subject matter hereof and supersedes all prior agreements if any whether written or oral between the parties with respect thereto.',
        },
        {
            kind: 'p',
            text: '6.5 No amendments or waiver of any of the provisions of this agreement shall be binding unless made in writing and signed by both parties.',
        },
        { kind: 'h2', text: '7. TERMINATION' },
        {
            kind: 'p',
            text: '7.1 First party may terminate this agreement at any time without giving any notice in the following circumstances:',
        },
        { kind: 'p', text: '(a) If the second party sells the potatoes to any third party.' },
        {
            kind: 'p',
            text: '(b) If the second party fails to perform any of his obligations and/or commits breach of any of the terms and conditions of this agreement.',
        },
        {
            kind: 'p',
            text: `(c) In the event of (a) & (b) above, first party will be entitled to encash the postdated ${terms.encashCheques} and all other dues received earlier will be the property of the first party.`,
        },
        { kind: 'h2', text: '8. JURISDICTION' },
        {
            kind: 'p',
            text: '8.1 Courts in Jalandhar will have exclusive jurisdiction in the event of any legal/jurisdictional proceedings.',
        },
        {
            kind: 'p',
            text: '8.2 This agreement has been read out to the second party in vernacular in the presence of the witnesses hereunder and the second party represents that he fully understands the terms and conditions of this agreement.',
        },
        {
            kind: 'p',
            text: 'In witness where of these presents have been executed on behalf of the parties hereto as of the day and year first above written.',
        },
        {
            kind: 'signatures',
            firstParty: 'First Party',
            secondParty: 'Second Party',
            sign: 'Signature',
            firstPartyCaption: '(First Party - Bhatti Agritech Pvt. Ltd.)',
            secondPartyCaption: '(Second Party- Grower)',
            witnesses: 'Witnesses:',
        },
        { kind: 'h2', text: 'ANNEXURE 1', breakBefore: true, underline: true },
        { kind: 'variety', id: 'annexure', text: `Variety: ${variety}` },
        {
            kind: 'p',
            text: terms.annexureIntro.en,
        },
        { kind: 'table', table: terms.annexure.en },
        {
            kind: 'p',
            text: terms.annexureNote.en,
        },
    ];
}
