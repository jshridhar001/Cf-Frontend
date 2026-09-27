import { StyleSheet } from '@react-pdf/renderer';
const green = '#166534';
export const styles = StyleSheet.create({
    page: {
        paddingTop: 78,
        paddingBottom: 52,
        paddingHorizontal: 40,
        fontFamily: 'Helvetica',
        fontSize: 9,
        lineHeight: 1.4,
        color: '#1a1a1a',
    },
    pageHindi: {
        fontFamily: 'Hind',
        lineHeight: 1.55,
    },
    header: {
        position: 'absolute',
        top: 16,
        left: 40,
        right: 40,
        alignItems: 'center',
        paddingBottom: 6,
        borderBottomWidth: 1.5,
        borderBottomColor: green,
    },
    logo: {
        width: 44,
        height: 44,
        objectFit: 'contain',
    },
    year: {
        marginTop: 8,
        textAlign: 'center',
        fontSize: 11,
        fontWeight: 700,
        color: '#525252',
    },
    title: {
        marginTop: 4,
        textAlign: 'center',
        fontSize: 13,
        fontWeight: 700,
    },
    variety: {
        marginTop: 2,
        marginBottom: 8,
        textAlign: 'center',
        fontSize: 10,
        fontWeight: 700,
        color: green,
    },
    varietyAnnexure: {
        marginTop: 2,
        marginBottom: 6,
        textAlign: 'center',
        fontSize: 10,
        fontWeight: 700,
    },
    bold: {
        fontWeight: 700,
    },
    center: {
        textAlign: 'center',
    },
    underline: {
        textDecoration: 'underline',
    },
    paragraph: {
        marginBottom: 6,
        textAlign: 'justify',
    },
    h2: {
        marginTop: 8,
        marginBottom: 4,
        fontSize: 11,
        fontWeight: 700,
        color: green,
    },
    h3: {
        marginTop: 6,
        marginBottom: 3,
        fontSize: 10,
        fontWeight: 700,
    },
    table: {
        marginTop: 4,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#d4d4d4',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
    },
    tableRowLast: {
        borderBottomWidth: 0,
    },
    tableCell: {
        paddingVertical: 4,
        paddingHorizontal: 6,
        textAlign: 'center',
    },
    tableHeader: {
        fontWeight: 700,
        backgroundColor: '#e8f5e9',
        color: green,
    },
    signatures: {
        flexDirection: 'row',
        marginTop: 18,
        gap: 24,
    },
    signatureBlock: {
        flex: 1,
    },
    signatureRole: {
        fontWeight: 700,
        marginBottom: 2,
    },
    signatureLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
        marginBottom: 4,
    },
    witnesses: {
        marginTop: 16,
        fontWeight: 700,
    },
    witnessLine: {
        marginTop: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
        width: '70%',
    },
    footer: {
        position: 'absolute',
        bottom: 22,
        left: 40,
        right: 40,
        fontSize: 8,
        textAlign: 'center',
        color: '#737373',
    },
});
