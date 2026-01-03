import win32com.client as win32
import os
import sys

excel_path = r"C:\Users\ESAT\Desktop\Son\son surec.xlsm"
output_file = r"C:\Users\ESAT\kkp-platform\vba_macros.txt"

print("VBA Makrolar cikariliyor...")
print(f"Dosya: {excel_path}\n")

try:
    # Excel uygulamasını başlat
    excel = win32.Dispatch("Excel.Application")
    excel.Visible = False
    excel.DisplayAlerts = False

    # Workbook'u aç
    wb = excel.Workbooks.Open(excel_path)

    vba_modules = []

    # VBA Project'i kontrol et
    vb_project = wb.VBProject

    print(f"VBA Project Adi: {vb_project.Name}")
    print(f"Modul Sayisi: {vb_project.VBComponents.Count}\n")

    # Tüm modülleri döngüyle al
    for component in vb_project.VBComponents:
        module_name = component.Name
        module_type = component.Type

        # Modül tipini belirle
        type_names = {
            1: "Standard Module",
            2: "Class Module",
            3: "MSForm",
            100: "Document Module"
        }
        type_name = type_names.get(module_type, f"Unknown ({module_type})")

        print(f"Modul: {module_name} - Tip: {type_name}")

        # Kod satır sayısı
        line_count = component.CodeModule.CountOfLines
        print(f"  Satir sayisi: {line_count}")

        if line_count > 0:
            # Kodları al
            code = component.CodeModule.Lines(1, line_count)
            vba_modules.append({
                "name": module_name,
                "type": type_name,
                "code": code
            })

            # İlk birkaç satırı göster
            lines = code.split('\n')[:5]
            for line in lines:
                if line.strip():
                    print(f"    {line}")
        print()

    # Dosyaya kaydet
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("="*80 + "\n")
        f.write("VBA MAKRO ANALIZI - son surec.xlsm\n")
        f.write("="*80 + "\n\n")

        for module in vba_modules:
            f.write(f"\n{'='*80}\n")
            f.write(f"MODUL: {module['name']} ({module['type']})\n")
            f.write(f"{'='*80}\n\n")
            f.write(module['code'])
            f.write("\n\n")

    print(f"VBA kodlar kaydedildi: {output_file}")

    # Excel'i kapat
    wb.Close(SaveChanges=False)
    excel.Quit()

    print("\nTamamlandi!")

except Exception as e:
    print(f"HATA: {e}")
    import traceback
    traceback.print_exc()

finally:
    try:
        excel.Quit()
    except:
        pass
