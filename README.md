# Product Catalog LIFF Demo v5

Baseline: Product_Catalog_LIFF_Demo_v4

## Changes
- Login with Staff ID / Password from `สารบัญ` -> `User`.
- Roles: `พนักงาน`, `Admin`.
- Employee sees Category + Brand only.
- Admin sees Category + Brand + ร้านค้า (Company).
- Backend validates session/role; hiding the menu alone is not used as security.
- Product Detail remains ONE shared page for Category / Sub Category / Brand / Company.
- Employee detail is restricted to approved fields; Admin sees all populated fields.
- Product image URL is read from column D of the actual product tab, including RichText hyperlink URLs and Google Drive links.

## User sheet
Add a tab named exactly `User` to the catalog workbook with headers:
`Staff ID | Password | Name | Role | Active`

Example roles:
- `พนักงาน`
- `Admin`

Active should be TRUE for enabled users.

## Deployment
1. Replace Code.gs with v5 Code.gs.
2. Deploy Apps Script Web App as a new version using the same deployment URL if possible.
3. Upload frontend files to GitHub Pages.
4. No API URL change is needed if the existing deployment URL remains the same.


## v7 changes
- Product name uses column AL (38), header `Display name`, with fallback to column F only if AL is empty.
- Product preview reads through AL so the displayed product name comes from Display name.
- Admin boolean fields show their header labels and checkbox-style TRUE/FALSE status.
- Admin registration/licensing fields show separate headers.
- Source remains v5 baseline plus the shared Product Detail design.


## v8 - Barcode
- Product Detail แสดง Barcode จากค่าคอลัมน์บาร์โค้ด
- 13 หลักใช้ EAN-13
- รูปแบบอื่นใช้ Code 39
- แสดงเลขใต้ Barcode
- ไม่มีปุ่มดาวน์โหลด/พิมพ์
- ฟีเจอร์ Barcode ทำที่ frontend จึงไม่ต้องแก้ Code.gs เพิ่ม


## FINAL
- ราคาขายและคนไทยอยู่บรรทัดเดียวกัน
- ระดับราคา 1 > ระดับราคา 2 อยู่บรรทัดถัดไปและจัดแนวใต้ฝั่งราคา
- ตัวอย่าง: ราคาขาย ฿777 / คนไทย ฿500  และ  (฿666 > ฿555)
- Barcode แสดงใน Product Detail


## FINAL v2
- ราคาขาย / คนไทย ชิดขวา
- ระดับราคา 1 > ระดับราคา 2 ชิดขวา
- ชื่อสินค้าอยู่กึ่งกลางหน้าเหมือนแนว Barcode


## FINAL v3
- ลบข้อความหัวข้อ "ราคา"
- "ราคาขาย" ชิดซ้าย
- ราคาขาย / คนไทย ชิดขวา
- ระดับราคา 1 > ระดับราคา 2 ชิดขวา
- หมวดหมู่ > หมวดหมู่ย่อย ย้ายไปมุมบนขวาเหนือ Barcode


## FINAL v5 - Admin price mapping confirmed
ใช้คอลัมน์จริง:
Y=Z, AA=AB, AC=AD, AE=AF, AG=AH

ตัวอย่าง:
Y=abc, Z=100 → บริษัท = abc / ฿100
AA=s1, AB=200 → ร้านที่ 1 = s1 / ฿200
AC=s2, AD=200 → ร้านที่ 2 = s2 / ฿200


## FINAL v6 - Admin Cost
- เฉพาะ Admin แสดง "ราคาทุน" จากคอลัมน์ K
- แสดงทันทีใต้หัวข้อ "ข้อมูลสำหรับ Admin"
- ไม่แสดงราคาทุนในมุมมองพนักงาน
