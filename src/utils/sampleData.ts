import { TransactionType } from '../types';

export interface SampleItem {
  type: TransactionType;
  amount: number;
  category: string;
  note: string;
  dayOffset: number; // day of month 1..28
  paymentMethod: string;
}

export const SAMPLE_TRANSACTIONS: SampleItem[] = [
  { type: 'income', amount: 35000, category: 'เงินเดือนประจำ', note: 'เงินเดือนเข้าบัญชีหลัก', dayOffset: 1, paymentMethod: 'bank_transfer' },
  { type: 'expense', amount: 4500, category: 'ที่อยู่อาศัยและบิล', note: 'ค่าเช่าห้องพัก', dayOffset: 2, paymentMethod: 'bank_transfer' },
  { type: 'expense', amount: 1250, category: 'ค่าน้ำค่าไฟ/อินเทอร์เน็ต', note: 'ค่าไฟและอินเทอร์เน็ตบ้าน', dayOffset: 3, paymentMethod: 'promptpay' },
  { type: 'expense', amount: 80, category: 'อาหารและเครื่องดื่ม', note: 'กาแฟอเมซอนเย็น', dayOffset: 4, paymentMethod: 'promptpay' },
  { type: 'expense', amount: 150, category: 'อาหารและเครื่องดื่ม', note: 'ข้าวกะเพราหมูกรอบไข่ดาว + น้ำ', dayOffset: 5, paymentMethod: 'cash' },
  { type: 'expense', amount: 800, category: 'การเดินทางและน้ำมัน', note: 'เติมน้ำมันเต็มถัง', dayOffset: 6, paymentMethod: 'credit_card' },
  { type: 'expense', amount: 650, category: 'ช้อปปิ้งของใช้', note: 'ซื้อของใช้ในห้องน้ำและซักผ้า', dayOffset: 8, paymentMethod: 'credit_card' },
  { type: 'expense', amount: 450, category: 'บันเทิงและสังสรรค์', note: 'ตั๋วหนัง + ป๊อปคอร์น', dayOffset: 10, paymentMethod: 'promptpay' },
  { type: 'income', amount: 4500, category: 'งานเสริม/ฟรีแลนซ์', note: 'รับออกแบบกราฟิก 67021 Jam', dayOffset: 12, paymentMethod: 'promptpay' },
  { type: 'expense', amount: 220, category: 'อาหารและเครื่องดื่ม', note: 'ชาบูมื้อเย็นกับเพื่อน', dayOffset: 14, paymentMethod: 'bank_transfer' },
  { type: 'expense', amount: 350, category: 'สุขภาพและการรักษา', note: 'วิตามินและยาแก้แพ้', dayOffset: 16, paymentMethod: 'cash' },
  { type: 'expense', amount: 490, category: 'การศึกษาและหนังสือ', note: 'หนังสือพัฒนาตนเอง', dayOffset: 18, paymentMethod: 'bank_transfer' },
  { type: 'expense', amount: 120, category: 'การเดินทางและน้ำมัน', note: 'ค่ารถไฟฟ้า BTS/MRT', dayOffset: 20, paymentMethod: 'credit_card' },
  { type: 'expense', amount: 180, category: 'อาหารและเครื่องดื่ม', note: 'ก๋วยเตี๋ยวและของหวาน', dayOffset: 22, paymentMethod: 'cash' },
  { type: 'income', amount: 1200, category: 'การลงทุนและปันผล', note: 'เงินปันผลกองทุนรวม', dayOffset: 25, paymentMethod: 'bank_transfer' },
];
