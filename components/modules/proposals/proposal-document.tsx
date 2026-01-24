import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Font kaydı (Türkçe karakter desteği için Roboto kullanıyoruz)
Font.register({
    family: 'Roboto',
    fonts: [
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf' },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' }
    ]
});

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 40,
        fontFamily: 'Roboto',
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
    },
    companyInfo: {
        fontSize: 10,
        color: '#6B7280',
        textAlign: 'right',
    },
    titleSection: {
        marginTop: 20,
        marginBottom: 30,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 12,
        color: '#4B5563',
    },
    customerSection: {
        marginBottom: 30,
        padding: 15,
        backgroundColor: '#F9FAFB',
        borderRadius: 4,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 5,
    },
    text: {
        fontSize: 10,
        color: '#4B5563',
        marginBottom: 2,
    },
    table: {
        display: 'flex',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    tableRow: {
        margin: 'auto',
        flexDirection: 'row',
    },
    tableColHeader: {
        width: '50%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderLeftWidth: 0,
        borderTopWidth: 0,
        backgroundColor: '#F3F4F6',
        padding: 8,
    },
    tableColHeaderSmall: {
        width: '16.6%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderLeftWidth: 0,
        borderTopWidth: 0,
        backgroundColor: '#F3F4F6',
        padding: 8,
    },
    tableCol: {
        width: '50%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderLeftWidth: 0,
        borderTopWidth: 0,
        padding: 8,
    },
    tableColSmall: {
        width: '16.6%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderLeftWidth: 0,
        borderTopWidth: 0,
        padding: 8,
    },
    tableCellHeader: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#374151',
    },
    tableCell: {
        fontSize: 10,
        color: '#111827',
    },
    totalSection: {
        marginTop: 20,
        alignItems: 'flex-end',
    },
    totalRow: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    totalLabel: {
        fontSize: 10,
        color: '#4B5563',
        width: 100,
        textAlign: 'right',
        marginRight: 10,
    },
    totalValue: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#111827',
        width: 80,
        textAlign: 'right',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        fontSize: 8,
        color: '#9CA3AF',
        textAlign: 'center',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 10,
    },
});

interface ProposalDocumentProps {
    data: {
        customerName: string;
        companyName: string;
        projectTitle: string;
        date: string;
        validUntil: string;
        items: Array<{
            description: string;
            quantity: number;
            unitPrice: number;
            total: number;
        }>;
        subtotal: number;
        tax: number;
        total: number;
    };
}

export const ProposalDocument = ({ data }: ProposalDocumentProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.logo}>SEMİH İŞ MERKEZİ</Text>
                <View>
                    <Text style={styles.companyInfo}>Video Prodüksiyon Hizmetleri</Text>
                    <Text style={styles.companyInfo}>info@semihismerkezi.com</Text>
                    <Text style={styles.companyInfo}>+90 555 123 45 67</Text>
                </View>
            </View>

            {/* Title */}
            <View style={styles.titleSection}>
                <Text style={styles.title}>FİYAT TEKLİFİ</Text>
                <Text style={styles.subtitle}>Proje: {data.projectTitle}</Text>
            </View>

            {/* Customer Info */}
            <View style={styles.customerSection}>
                <Text style={styles.sectionTitle}>SAYIN:</Text>
                <Text style={styles.text}>{data.customerName}</Text>
                <Text style={styles.text}>{data.companyName}</Text>
                <Text style={{ ...styles.text, marginTop: 10 }}>Tarih: {data.date}</Text>
                <Text style={styles.text}>Geçerlilik: {data.validUntil}</Text>
            </View>

            {/* Table */}
            <View style={styles.table}>
                <View style={styles.tableRow}>
                    <View style={styles.tableColHeader}>
                        <Text style={styles.tableCellHeader}>Hizmet / Açıklama</Text>
                    </View>
                    <View style={styles.tableColHeaderSmall}>
                        <Text style={styles.tableCellHeader}>Miktar</Text>
                    </View>
                    <View style={styles.tableColHeaderSmall}>
                        <Text style={styles.tableCellHeader}>Birim Fiyat</Text>
                    </View>
                    <View style={styles.tableColHeaderSmall}>
                        <Text style={styles.tableCellHeader}>Toplam</Text>
                    </View>
                </View>
                {data.items.map((item, index) => (
                    <View style={styles.tableRow} key={index}>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableCell}>{item.description}</Text>
                        </View>
                        <View style={styles.tableColSmall}>
                            <Text style={styles.tableCell}>{item.quantity}</Text>
                        </View>
                        <View style={styles.tableColSmall}>
                            <Text style={styles.tableCell}>{item.unitPrice.toLocaleString('tr-TR')} TL</Text>
                        </View>
                        <View style={styles.tableColSmall}>
                            <Text style={styles.tableCell}>{item.total.toLocaleString('tr-TR')} TL</Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Totals */}
            <View style={styles.totalSection}>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Ara Toplam:</Text>
                    <Text style={styles.totalValue}>{data.subtotal.toLocaleString('tr-TR')} TL</Text>
                </View>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>KDV (%20):</Text>
                    <Text style={styles.totalValue}>{data.tax.toLocaleString('tr-TR')} TL</Text>
                </View>
                <View style={{ ...styles.totalRow, marginTop: 5 }}>
                    <Text style={{ ...styles.totalLabel, fontWeight: 'bold', color: '#000' }}>GENEL TOPLAM:</Text>
                    <Text style={{ ...styles.totalValue, fontSize: 12 }}>{data.total.toLocaleString('tr-TR')} TL</Text>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text>Bu teklif {data.validUntil} tarihine kadar geçerlidir. Ödeme %50 peşin, %50 iş tesliminde tahsil edilir.</Text>
                <Text style={{ marginTop: 5 }}>Semih İş Merkezi | www.semihismerkezi.com</Text>
            </View>
        </Page>
    </Document>
);
